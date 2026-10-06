import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '../../common/interfaces/status';
import { createUniqueUid } from '../../common/utils/createRandomUid';
import { fenToYuan, yuanToFen } from '../../common/utils/money';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { RedisCacheService } from '../redisCache/redisCache.service';
import { WechatMiniService } from '../wechat-mini/wechat-mini.service';
import { XpayClientService } from './xpay-client.service';
import { XpayIosRefundQueryNotify } from './xpay.types';

const DELIVER_LOCK_PREFIX = 'xpay:deliver:';
const REFUND_LOCK_PREFIX = 'xpay:refund:';
/** 微信现金单：已支付待发货 / 发货中 / 已发货 */
const WX_PAID_STATUSES = new Set([2, 3, 4]);
/** 微信退款完成态 */
const WX_REFUNDED_STATUSES = new Set([5, 8]);

/**
 * 道具直购：下单签名、发货、退款。
 */
@Injectable()
export class XpayPayService {
  private readonly logger = new Logger(XpayPayService.name);

  constructor(
    private readonly xpayClient: XpayClientService,
    private readonly wechatMiniService: WechatMiniService,
    private readonly redisCacheService: RedisCacheService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(VirtualGoods)
    private readonly goodsRepository: Repository<VirtualGoods>,
    @InjectRepository(GiftCode)
    private readonly giftCodeRepository: Repository<GiftCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 生成业务单号（8-32，不以 _ 开头）。
   *
   * @param prefix 前缀
   */
  private createBizNo(prefix: 'o' | 'r'): string {
    return `${prefix}${Date.now()}${createUniqueUid(10)}`;
  }

  /**
   * 是否 iOS 客户端。
   *
   * @param platform 系统平台
   */
  private isIosPlatform(platform?: string | null): boolean {
    return (platform ?? '').toLowerCase() === 'ios';
  }

  /**
   * 创建本地订单并返回 wx.requestVirtualPayment 参数。价格只信服务端。
   *
   * @param userId 当前用户
   * @param goodsId 商品 / 道具 ID
   * @param platform 客户端 platform
   * @param buyQuantity 购买数量
   * @param attach 透传
   */
  async createPayParams(
    userId: number,
    goodsId: string,
    platform: string,
    buyQuantity = 1,
    attach = '',
  ) {
    this.xpayClient.assertEnabled();
    const env = this.xpayClient.getEnv();
    if (env === 1 && this.isIosPlatform(platform)) {
      throw new HttpException('沙箱环境不支持 iOS Apple 支付，请使用现网 env=0', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.openId) {
      throw new HttpException('当前账号未绑定微信', HttpStatus.BAD_REQUEST);
    }
    const goods = await this.goodsRepository.findOne({ where: { goodsId } });
    if (!goods || goods.status !== Status.GoodsShelfStatus.On) {
      throw new HttpException('商品不存在或已下架', HttpStatus.BAD_REQUEST);
    }
    if (goods.xpaySyncStatus !== Status.XpayGoodsSyncStatus.Published) {
      throw new HttpException('道具尚未发布到虚拟支付，无法下单', HttpStatus.BAD_REQUEST);
    }

    const quantity = Math.max(1, Math.floor(buyQuantity));
    const unitFen = yuanToFen(goods.price);
    const amountFen = unitFen * quantity;
    const orderNo = this.createBizNo('o');
    const signDataObject = {
      offerId: this.xpayClient.getOfferId(),
      buyQuantity: quantity,
      env,
      currencyType: 'CNY',
      productId: goods.goodsId,
      goodsPrice: unitFen,
      outTradeNo: orderNo,
      attach: attach || goods.goodsId,
    };
    const signData = JSON.stringify(signDataObject);
    const sessionKey = await this.wechatMiniService.requireSessionKey(user.openId);
    const paySig = this.xpayClient.calcPaySig('requestVirtualPayment', signData, env);
    const signature = this.xpayClient.calcUserSignature(signData, sessionKey);

    const order = this.orderRepository.create({
      orderNo,
      payStatus: Status.PayStatus.Unpaid,
      orderStatus: Status.OrderStatus.Normal,
      deliverStatus: Status.DeliverStatus.Pending,
      userId: user.id,
      userName: user.username,
      goodsId: goods.goodsId,
      goodsName: goods.name,
      amount: fenToYuan(amountFen),
      amountFen,
      quantity,
      env,
      platform,
      payChannel: this.isIosPlatform(platform) ? 'apple' : 'wechat',
      createdBy: user.id,
      updatedBy: user.id,
    });
    await this.orderRepository.save(order);

    return {
      mode: 'short_series_goods',
      signData,
      paySig,
      signature,
      orderNo,
      env,
      productId: goods.goodsId,
      goodsPrice: unitFen,
    };
  }

  /**
   * 查询微信现金单。
   *
   * @param order 本地订单
   */
  private async queryWxOrder(order: Order) {
    const user = await this.userRepository.findOne({ where: { id: order.userId } });
    if (!user?.openId) {
      throw new HttpException('订单用户未绑定微信', HttpStatus.BAD_REQUEST);
    }
    const data = await this.xpayClient.post('/xpay/query_order', {
      openid: user.openId,
      env: order.env,
      order_id: order.orderNo,
    });
    return { openId: user.openId, order: data.order };
  }

  /**
   * 发货完成后补偿通知微信（仅现金单、且推送未成功确认时）。
   *
   * @param order 本地订单
   */
  private async notifyProvideGoodsIfNeeded(order: Order): Promise<void> {
    if (order.deliverNotifyAcked === 1 || order.provideGoodsNotified === 1) {
      return;
    }
    if (order.wxOrderStatus === 4) {
      return;
    }
    try {
      await this.xpayClient.post(
        '/xpay/notify_provide_goods',
        {
          order_id: order.orderNo,
          env: order.env,
        },
      );
      order.provideGoodsNotified = 1;
      await this.orderRepository.save(order);
    } catch (error) {
      this.logger.warn(
        `notify_provide_goods ${order.orderNo} 失败: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * 绑定一枚未使用兑换码（悲观锁）。
   *
   * @param goodsId 商品 ID
   * @param orderNo 订单号
   * @param userId 操作人
   */
  private async bindGiftCode(goodsId: string, orderNo: string, userId: number): Promise<string> {
    return this.giftCodeRepository.manager.transaction(async (manager) => {
      const existing = await manager.findOne(GiftCode, { where: { orderNo } });
      if (existing) {
        return existing.code;
      }
      const gift = await manager
        .createQueryBuilder(GiftCode, 'gift')
        .setLock('pessimistic_write')
        .where('gift.goodsId = :goodsId', { goodsId })
        .andWhere('gift.status = :status', { status: Status.GiftCodeStatus.Unused })
        .orderBy('gift.id', 'ASC')
        .getOne();
      if (!gift) {
        throw new HttpException('兑换码库存不足，支付成功后将自动重试发货', HttpStatus.CONFLICT);
      }
      gift.status = Status.GiftCodeStatus.Bound;
      gift.orderNo = orderNo;
      gift.updatedBy = userId;
      await manager.save(gift);
      return gift.code;
    });
  }

  /**
   * 幂等发货：绑定兑换码并完结订单。
   *
   * @param orderNo 业务单号
   * @param options.fromPush 是否来自发货推送（成功后不再调 notify_provide_goods）
   * @param options.wxOrderId 微信单号
   * @param options.wxStatus 微信订单状态
   */
  async deliverOrder(
    orderNo: string,
    options?: { fromPush?: boolean; wxOrderId?: string; wxStatus?: number },
  ): Promise<Order> {
    const locked = await this.redisCacheService.setNx(`${DELIVER_LOCK_PREFIX}${orderNo}`, '1', 30);
    if (!locked) {
      const current = await this.orderRepository.findOne({ where: { orderNo } });
      if (!current) {
        throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
      }
      return current;
    }

    try {
      const order = await this.orderRepository.findOne({ where: { orderNo } });
      if (!order) {
        throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
      }
      if (order.payStatus === Status.PayStatus.Refunded) {
        return order;
      }
      if (options?.wxOrderId) {
        order.wxOrderId = options.wxOrderId;
      }
      if (options?.wxStatus != null) {
        order.wxOrderStatus = options.wxStatus;
      }
      if (options?.fromPush) {
        order.deliverNotifyAcked = 1;
      }

      order.payStatus = Status.PayStatus.Success;
      if (order.deliverStatus === Status.DeliverStatus.Delivered && order.deliveredCode) {
        await this.orderRepository.save(order);
        if (!options?.fromPush) {
          await this.notifyProvideGoodsIfNeeded(order);
        }
        return order;
      }

      const code = await this.bindGiftCode(order.goodsId, order.orderNo, order.userId);
      order.deliveredCode = code;
      order.deliverStatus = Status.DeliverStatus.Delivered;
      order.orderStatus = Status.OrderStatus.Finished;
      order.updatedBy = order.userId;
      await this.orderRepository.save(order);

      if (!options?.fromPush) {
        await this.notifyProvideGoodsIfNeeded(order);
      }
      return order;
    } finally {
      await this.redisCacheService.del({ key: `${DELIVER_LOCK_PREFIX}${orderNo}` });
    }
  }

  /**
   * 根据 query_order 同步一笔本地单（轮询分支）。
   *
   * @param order 本地订单
   */
  async syncFromWxQuery(order: Order): Promise<Order> {
    if (!this.xpayClient.isEnabled()) {
      return order;
    }
    const { order: wxOrder } = await this.queryWxOrder(order);
    const wxStatus = wxOrder?.status;
    order.wxOrderStatus = wxStatus ?? order.wxOrderStatus;
    order.wxOrderId = wxOrder?.wx_order_id || order.wxOrderId;
    if (wxStatus != null && WX_REFUNDED_STATUSES.has(wxStatus)) {
      return this.applyLocalRefund(order, order.refundOrderNo ?? '');
    }
    if (wxStatus != null && WX_PAID_STATUSES.has(wxStatus)) {
      return this.deliverOrder(order.orderNo, {
        fromPush: false,
        wxOrderId: wxOrder?.wx_order_id,
        wxStatus,
      });
    }
    if (wxStatus === 6) {
      order.payStatus = Status.PayStatus.Failed;
      await this.orderRepository.save(order);
    }
    return order;
  }

  /**
   * 客户端支付成功回调（可能丢失，仍走 query_order）。
   *
   * @param userId 当前用户
   * @param orderNo 业务单号
   */
  async confirmByClient(userId: number, orderNo: string): Promise<Order> {
    this.xpayClient.assertEnabled();
    const order = await this.orderRepository.findOne({ where: { orderNo, userId } });
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    return this.syncFromWxQuery(order);
  }

  /**
   * 当前用户查询自己的订单。
   *
   * @param userId 用户
   * @param orderNo 单号
   */
  async findMine(userId: number, orderNo: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { orderNo, userId } });
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  /**
   * 轮询未完结现金单。
   */
  async pollPendingOrders(): Promise<void> {
    if (!this.xpayClient.isEnabled()) {
      return;
    }
    const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const pending = await this.orderRepository.find({
      where: [
        { payStatus: Status.PayStatus.Unpaid, orderStatus: Status.OrderStatus.Normal },
        { payStatus: Status.PayStatus.Success, deliverStatus: Status.DeliverStatus.Pending },
      ],
      take: 50,
      order: { id: 'ASC' },
    });
    for (const order of pending) {
      if (order.createdAt < since && order.payStatus === Status.PayStatus.Unpaid) {
        continue;
      }
      try {
        await this.syncFromWxQuery(order);
      } catch (error) {
        this.logger.warn(
          `轮询订单 ${order.orderNo} 失败: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  /**
   * 本地退款回收权益（幂等）。
   *
   * @param order 订单
   * @param refundOrderNo 退款单号
   */
  async applyLocalRefund(order: Order, refundOrderNo: string): Promise<Order> {
    const locked = await this.redisCacheService.setNx(`${REFUND_LOCK_PREFIX}${order.orderNo}`, '1', 30);
    if (!locked) {
      return order;
    }
    try {
      const latest = await this.orderRepository.findOne({ where: { id: order.id } });
      if (!latest) {
        return order;
      }
      if (latest.payStatus === Status.PayStatus.Refunded) {
        return latest;
      }
      if (latest.deliveredCode) {
        const gift = await this.giftCodeRepository.findOne({ where: { orderNo: latest.orderNo } });
        if (gift && gift.status !== Status.GiftCodeStatus.Voided) {
          gift.status = Status.GiftCodeStatus.Voided;
          gift.updatedBy = latest.userId;
          await this.giftCodeRepository.save(gift);
        }
      }
      latest.payStatus = Status.PayStatus.Refunded;
      latest.orderStatus = Status.OrderStatus.Finished;
      latest.refundOrderNo = refundOrderNo || latest.refundOrderNo;
      latest.updatedBy = latest.userId;
      return this.orderRepository.save(latest);
    } finally {
      await this.redisCacheService.del({ key: `${REFUND_LOCK_PREFIX}${order.orderNo}` });
    }
  }

  /**
   * 按业务单号或微信单号查找。
   *
   * @param orderNo 业务单号
   * @param wxOrderId 微信单号
   */
  async findByWxOrBizNo(orderNo?: string, wxOrderId?: string): Promise<Order | null> {
    if (orderNo) {
      const byBiz = await this.orderRepository.findOne({ where: { orderNo } });
      if (byBiz) {
        return byBiz;
      }
    }
    if (wxOrderId) {
      return this.orderRepository.findOne({ where: { wxOrderId } });
    }
    return null;
  }

  /**
   * 商户主动退款（非 Apple 渠道）。先 query_order 取 left_fee。
   *
   * @param orderId 本地主键
   * @param operatorId 操作人
   * @param refundReason 退款原因 0-5
   * @param reqFrom 来源 1/2/3
   * @param refundFeeFen 本次退款金额（分），默认全部 left_fee
   */
  async refundByAdmin(
    orderId: number,
    operatorId: number,
    refundReason: string,
    reqFrom: string,
    refundFeeFen?: number,
  ): Promise<Order> {
    this.xpayClient.assertEnabled();
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    if (order.payChannel === 'apple') {
      throw new HttpException('iOS Apple 支付不支持商户主动退款，需用户在 App Store 申请', HttpStatus.BAD_REQUEST);
    }
    if (order.payStatus !== Status.PayStatus.Success) {
      throw new HttpException('仅支付成功的订单可退款', HttpStatus.BAD_REQUEST);
    }

    const { openId, order: wxOrder } = await this.queryWxOrder(order);
    const leftFee = wxOrder?.left_fee ?? order.amountFen;
    const refundFee = refundFeeFen ?? leftFee;
    if (refundFee <= 0 || refundFee > leftFee) {
      throw new HttpException('退款金额不合法，请核对 left_fee', HttpStatus.BAD_REQUEST);
    }

    const refundOrderNo = this.createBizNo('r');
    const data = await this.xpayClient.post('/xpay/refund_order', {
      openid: openId,
      order_id: order.orderNo,
      refund_order_id: refundOrderNo,
      left_fee: leftFee,
      refund_fee: refundFee,
      biz_meta: order.orderNo,
      refund_reason: refundReason,
      req_from: reqFrom,
      env: order.env,
    });
    order.refundOrderNo = data.refund_order_id || refundOrderNo;
    order.updatedBy = operatorId;
    await this.orderRepository.save(order);

    try {
      return await this.syncFromWxQuery(order);
    } catch {
      return order;
    }
  }

  /**
   * 应答 iOS 退款问询：已发货则建议拦截，未发货建议退款。
   *
   * @param notify 问询内容
   */
  async answerIosRefundQuery(notify: XpayIosRefundQueryNotify): Promise<{
    result_code: number;
    result_info: string;
    evidence: string;
  }> {
    const order = await this.findByWxOrBizNo(notify.payOrderId, notify.payOrderId);
    const delivered =
      order?.deliverStatus === Status.DeliverStatus.Delivered || notify.provideStatus === '1';
    if (delivered) {
      return {
        result_code: 1,
        result_info: '已发货，建议拒绝退款',
        evidence: `订单 ${order?.orderNo ?? notify.payOrderId} 已交付兑换码 ${order?.deliveredCode ?? ''}`.trim(),
      };
    }
    return {
      result_code: 0,
      result_info: '未发货，建议退款',
      evidence: `订单 ${order?.orderNo ?? notify.payOrderId ?? ''} 尚未发货`,
    };
  }

  /**
   * 凭证是否已配置（不回传密钥）。
   */
  getCredentialStatus() {
    const env = this.xpayClient.getEnv();
    let appKeyConfigured = false;
    try {
      this.xpayClient.getAppKey(env);
      appKeyConfigured = true;
    } catch {
      appKeyConfigured = false;
    }
    let offerIdConfigured = false;
    try {
      this.xpayClient.getOfferId();
      offerIdConfigured = true;
    } catch {
      offerIdConfigured = false;
    }
    return {
      enabled: this.xpayClient.isEnabled(),
      env,
      offerIdConfigured,
      appKeyConfigured,
      tokenConfigured: Boolean(this.xpayClient.getToken()),
      aesKeyConfigured: Boolean(this.xpayClient.getEncodingAesKey()),
      note: env === 1 ? '沙箱仅可用于 Android 等微信支付；iOS 只能现网验证' : '现网环境，iOS 走 Apple 支付',
    };
  }
}

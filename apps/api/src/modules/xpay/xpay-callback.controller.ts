import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { SkipResult } from '../../common/decorators/skipResult.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  decryptWechatMessage,
  readXmlTag,
  verifyWechatCallbackSignature,
} from './xpay-crypto';
import { RefundXpayOrderDto } from './dto/xpay.dto';
import { XpayClientService } from './xpay-client.service';
import { XpayPayService } from './xpay-pay.service';
import {
  XpayGoodsDeliverNotify,
  XpayIosRefundQueryNotify,
  XpayRefundNotify,
} from './xpay.types';

/**
 * 微信消息推送：发货 / 退款 / iOS 退款问询。
 */
@ApiTags('虚拟支付回调')
@Controller('xpay')
export class XpayCallbackController {
  constructor(
    private readonly xpayClient: XpayClientService,
    private readonly xpayPayService: XpayPayService,
  ) {}

  /**
   * URL 有效性校验。
   */
  @Get('callback')
  @SkipResult()
  @ApiOperation({ summary: '虚拟支付消息推送校验' })
  verify(
    @Query('signature') signature: string,
    @Query('timestamp') timestamp: string,
    @Query('nonce') nonce: string,
    @Query('echostr') echostr: string,
    @Res() res: Response,
  ) {
    const token = this.xpayClient.getToken();
    if (!verifyWechatCallbackSignature(token, signature, timestamp, nonce)) {
      res.status(403).send('invalid signature');
      return;
    }
    res.status(200).send(echostr ?? '');
  }

  /**
   * 接收事件推送。
   */
  @Post('callback')
  @SkipResult()
  @ApiOperation({ summary: '虚拟支付消息推送' })
  async handle(@Req() req: Request, @Res() res: Response) {
    try {
      const payload = await this.parsePayload(req);
      if (payload.event === 'xpay_goods_deliver_notify' && 'outTradeNo' in payload) {
        await this.xpayPayService.deliverOrder(payload.outTradeNo, { fromPush: true });
        this.sendOk(res, req);
        return;
      }
      if (payload.event === 'xpay_refund_notify' && 'retCode' in payload) {
        if (payload.retCode === 0) {
          const order = await this.xpayPayService.findByWxOrBizNo(payload.mchOrderId, payload.wxOrderId);
          if (order) {
            await this.xpayPayService.applyLocalRefund(order, payload.mchRefundId ?? '');
          }
        }
        this.sendOk(res, req);
        return;
      }
      if (payload.event === 'xpay_subscribe_ios_refund_query_notify' && 'payOrderId' in payload) {
        const answer = await this.xpayPayService.answerIosRefundQuery(payload);
        res.status(200).json(answer);
        return;
      }
      this.sendOk(res, req);
    } catch {
      res.status(200).json({ ErrCode: -1, ErrMsg: 'fail' });
    }
  }

  /**
   * 凭证配置状态（不含密钥）。
   */
  @Get('credential-status')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '虚拟支付凭证是否已配置' })
  credentialStatus() {
    return this.xpayPayService.getCredentialStatus();
  }

  /**
   * 后台发起退款。
   */
  @Post('orders/:id/refund')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '启动订单退款' })
  refund(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: RefundXpayOrderDto,
    @Req() req: Request,
  ) {
    return this.xpayPayService.refundByAdmin(
      id,
      req.user!.id,
      body.refundReason,
      body.reqFrom,
      body.refundFeeFen,
    );
  }

  /**
   * 按推送格式回成功。
   *
   * @param res 响应
   * @param req 请求
   */
  private sendOk(res: Response, req: Request): void {
    const contentType = String(req.headers['content-type'] ?? '');
    if (contentType.includes('xml')) {
      res
        .status(200)
        .type('application/xml')
        .send('<xml><ErrCode>0</ErrCode><ErrMsg><![CDATA[success]]></ErrMsg></xml>');
      return;
    }
    res.status(200).json({ ErrCode: 0, ErrMsg: 'success' });
  }

  /**
   * 解析 XML / JSON / 加密包。
   *
   * @param req 请求
   */
  private async parsePayload(
    req: Request,
  ): Promise<XpayGoodsDeliverNotify | XpayRefundNotify | XpayIosRefundQueryNotify | { event: string }> {
    const raw = this.readRawBody(req);
    let text = raw;
    const aesKey = this.xpayClient.getEncodingAesKey();
    if (aesKey && raw.includes('Encrypt')) {
      const encrypt = this.extractEncrypt(raw, req.body);
      if (encrypt) {
        text = decryptWechatMessage(encrypt, aesKey);
      }
    }
    if (text.trim().startsWith('<') || text.includes('<xml')) {
      return this.parseXmlEvent(text);
    }
    const json = this.asObject(req.body) ?? this.tryJson(text);
    return this.parseJsonEvent(json ?? {});
  }

  /**
   * 读取原始 body。
   *
   * @param req 请求
   */
  private readRawBody(req: Request): string {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (rawBody?.length) {
      return rawBody.toString('utf8');
    }
    if (typeof req.body === 'string') {
      return req.body;
    }
    if (req.body && typeof req.body === 'object') {
      return JSON.stringify(req.body);
    }
    return '';
  }

  /**
   * 取出 Encrypt。
   *
   * @param raw 原文
   * @param body 已解析 body
   */
  private extractEncrypt(raw: string, body: unknown): string {
    const fromXml = readXmlTag(raw, 'Encrypt');
    if (fromXml) {
      return fromXml;
    }
    const obj = this.asObject(body);
    return String(obj?.Encrypt ?? obj?.encrypt ?? '');
  }

  /**
   * 解析 XML 事件。
   *
   * @param xml XML
   */
  private parseXmlEvent(
    xml: string,
  ): XpayGoodsDeliverNotify | XpayRefundNotify | XpayIosRefundQueryNotify | { event: string } {
    const event = readXmlTag(xml, 'Event');
    if (event === 'xpay_goods_deliver_notify') {
      return {
        event,
        openId: readXmlTag(xml, 'OpenId'),
        outTradeNo: readXmlTag(xml, 'OutTradeNo'),
        env: Number(readXmlTag(xml, 'Env') || 0),
        productId: readXmlTag(xml, 'ProductId'),
        quantity: Number(readXmlTag(xml, 'Quantity') || 1),
        attach: readXmlTag(xml, 'Attach'),
      };
    }
    if (event === 'xpay_refund_notify') {
      return {
        event,
        openId: readXmlTag(xml, 'OpenId'),
        mchOrderId: readXmlTag(xml, 'MchOrderId'),
        wxOrderId: readXmlTag(xml, 'WxOrderId'),
        retCode: Number(readXmlTag(xml, 'RetCode') || 0),
        mchRefundId: readXmlTag(xml, 'MchRefundId'),
      };
    }
    if (event === 'xpay_subscribe_ios_refund_query_notify') {
      return {
        event,
        payOrderId: readXmlTag(xml, 'pay_order_id') || readXmlTag(xml, 'PayOrderId'),
        productId: readXmlTag(xml, 'product_id') || readXmlTag(xml, 'ProductId'),
        provideStatus: readXmlTag(xml, 'provide_status') || readXmlTag(xml, 'ProvideStatus'),
      };
    }
    return { event };
  }

  /**
   * 解析 JSON 事件。
   *
   * @param json 对象
   */
  private parseJsonEvent(
    json: Record<string, unknown>,
  ): XpayGoodsDeliverNotify | XpayRefundNotify | XpayIosRefundQueryNotify | { event: string } {
    const event = String(json.Event ?? json.event ?? '');
    const goodsInfo = this.asObject(json.GoodsInfo);
    if (event === 'xpay_goods_deliver_notify') {
      return {
        event,
        openId: String(json.OpenId ?? ''),
        outTradeNo: String(json.OutTradeNo ?? ''),
        env: Number(json.Env ?? 0),
        productId: goodsInfo ? String(goodsInfo.ProductId ?? '') : undefined,
        quantity: goodsInfo ? Number(goodsInfo.Quantity ?? 1) : 1,
        attach: goodsInfo ? String(goodsInfo.Attach ?? '') : undefined,
      };
    }
    if (event === 'xpay_refund_notify') {
      return {
        event,
        openId: String(json.OpenId ?? ''),
        mchOrderId: String(json.MchOrderId ?? ''),
        wxOrderId: String(json.WxOrderId ?? ''),
        retCode: Number(json.RetCode ?? 0),
        mchRefundId: String(json.MchRefundId ?? ''),
      };
    }
    if (event === 'xpay_subscribe_ios_refund_query_notify') {
      const nested = this.asObject(json.WxaVirtualPayIosRefundQueryNotifyEvent) ?? json;
      return {
        event,
        payOrderId: String(nested.pay_order_id ?? nested.PayOrderId ?? ''),
        productId: String(nested.product_id ?? ''),
        provideStatus: String(nested.provide_status ?? ''),
      };
    }
    return { event };
  }

  /**
   * 对象化。
   *
   * @param value 任意值
   */
  private asObject(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return null;
  }

  /**
   * 尝试 JSON.parse。
   *
   * @param text 文本
   */
  private tryJson(text: string): Record<string, unknown> | null {
    try {
      return this.asObject(JSON.parse(text));
    } catch {
      return null;
    }
  }
}

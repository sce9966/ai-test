import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '../../common/interfaces/status';
import { yuanToFen } from '../../common/utils/money';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { XpayClientService } from './xpay-client.service';

const POLL_INTERVAL_MS = 1000;
const POLL_MAX_TIMES = 30;

/**
 * 虚拟商品与微信道具同步：上传开发版 → 发布现网。
 */
@Injectable()
export class XpayGoodsService {
  private readonly logger = new Logger(XpayGoodsService.name);

  constructor(
    private readonly xpayClient: XpayClientService,
    @InjectRepository(VirtualGoods)
    private readonly goodsRepository: Repository<VirtualGoods>,
  ) {}

  /**
   * 等待异步任务结束。
   *
   * @param ms 毫秒
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * 创建或更新后同步道具。未启用虚拟支付时跳过。
   *
   * @param goods 本地商品
   */
  async syncGoods(goods: VirtualGoods): Promise<VirtualGoods> {
    if (!this.xpayClient.isEnabled()) {
      return goods;
    }

    try {
      await this.uploadAndPublish(goods);
      goods.xpaySyncStatus = Status.XpayGoodsSyncStatus.Published;
      goods.xpaySyncMessage = null;
    } catch (error) {
      goods.xpaySyncStatus = Status.XpayGoodsSyncStatus.Failed;
      goods.xpaySyncMessage = error instanceof Error ? error.message : '道具同步失败';
      this.logger.error(`道具 ${goods.goodsId} 同步失败: ${goods.xpaySyncMessage}`);
      await this.goodsRepository.save(goods);
      throw new HttpException(goods.xpaySyncMessage, HttpStatus.BAD_REQUEST);
    }
    return this.goodsRepository.save(goods);
  }

  /**
   * 上传并发布单个道具。
   *
   * @param goods 本地商品
   */
  private async uploadAndPublish(goods: VirtualGoods): Promise<void> {
    const env = this.xpayClient.getEnv();
    const price = yuanToFen(goods.price);
    if (price <= 0) {
      throw new HttpException('道具单价必须大于 0 元才能同步到虚拟支付', HttpStatus.BAD_REQUEST);
    }
    const itemUrl = goods.coverUrls?.[0];
    if (!itemUrl) {
      throw new HttpException('道具封面不能为空', HttpStatus.BAD_REQUEST);
    }

    await this.startTask('/xpay/start_upload_goods', {
      env,
      upload_item: [
        {
          id: goods.goodsId,
          name: goods.name,
          price,
          remark: goods.remark,
          item_url: itemUrl,
        },
      ],
    });

    await this.waitUpload(goods.goodsId, env);
    goods.xpaySyncStatus = Status.XpayGoodsSyncStatus.Uploaded;

    await this.startTask('/xpay/start_publish_goods', {
      env,
      publish_item: [{ id: goods.goodsId }],
    });
    await this.waitPublish(goods.goodsId, env);
  }

  /**
   * 启动上传/发布任务；重复操作或任务运行中则继续轮询。
   *
   * @param uri 接口路径
   * @param payload 请求体
   */
  private async startTask(uri: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await this.xpayClient.post(uri, payload);
    } catch (error) {
      const message = error instanceof HttpException ? error.message : '';
      if (message.includes('268490004') || message.includes('268490012') || message.includes('已经存在')) {
        return;
      }
      throw error;
    }
  }

  /**
   * 轮询上传任务。
   *
   * @param goodsId 道具 ID
   * @param env 环境
   */
  private async waitUpload(goodsId: string, env: number): Promise<void> {
    for (let i = 0; i < POLL_MAX_TIMES; i += 1) {
      const data = await this.xpayClient.post('/xpay/query_upload_goods', { env });
      if (data.status === 1) {
        await this.sleep(POLL_INTERVAL_MS);
        continue;
      }
      const item = data.upload_item?.find((row) => row.id === goodsId);
      if (data.status === 3 || item?.upload_status === 2 || item?.upload_status === 1) {
        return;
      }
      throw new HttpException(item?.errmsg || '道具上传失败', HttpStatus.BAD_REQUEST);
    }
    throw new HttpException('道具上传超时，请稍后重试', HttpStatus.BAD_GATEWAY);
  }

  /**
   * 轮询发布任务。
   *
   * @param goodsId 道具 ID
   * @param env 环境
   */
  private async waitPublish(goodsId: string, env: number): Promise<void> {
    for (let i = 0; i < POLL_MAX_TIMES; i += 1) {
      const data = await this.xpayClient.post('/xpay/query_publish_goods', { env });
      if (data.status === 1) {
        await this.sleep(POLL_INTERVAL_MS);
        continue;
      }
      const item = data.publish_item?.find((row) => row.id === goodsId);
      if (data.status === 3 || item?.publish_status === 2 || item?.publish_status === 1) {
        return;
      }
      throw new HttpException(item?.errmsg || '道具发布失败', HttpStatus.BAD_REQUEST);
    }
    throw new HttpException('道具发布超时，发布后约 10 分钟生效', HttpStatus.BAD_GATEWAY);
  }
}

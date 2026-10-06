import { createHmac } from 'crypto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WechatAccessTokenService } from '../wechat-mini/wechat-access-token.service';
import { XpayApiResult } from './xpay.types';

const WECHAT_API_BASE = 'https://api.weixin.qq.com';

/**
 * 微信虚拟支付 HTTP 客户端：access_token + pay_sig。
 */
@Injectable()
export class XpayClientService {
  private readonly logger = new Logger(XpayClientService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly wechatAccessTokenService: WechatAccessTokenService,
  ) {}

  /**
   * 是否启用虚拟支付对接。
   */
  isEnabled(): boolean {
    return this.configService.get<boolean>('wechatXpay.enabled') === true;
  }

  /**
   * 当前环境：0 现网 / 1 沙箱。
   */
  getEnv(): 0 | 1 {
    return this.configService.get<number>('wechatXpay.env') === 1 ? 1 : 0;
  }

  /**
   * OfferID。
   */
  getOfferId(): string {
    const offerId = this.configService.get<string>('wechatXpay.offerId') ?? '';
    if (!offerId) {
      throw new HttpException('请先配置 WECHAT_XPAY_OFFER_ID', HttpStatus.BAD_REQUEST);
    }
    return offerId;
  }

  /**
   * 按环境取 AppKey。
   *
   * @param env 0 现网 / 1 沙箱
   */
  getAppKey(env: number = this.getEnv()): string {
    const key =
      env === 1
        ? (this.configService.get<string>('wechatXpay.sandboxAppKey') ?? '')
        : (this.configService.get<string>('wechatXpay.appKey') ?? '');
    if (!key) {
      throw new HttpException(
        env === 1 ? '请先配置 WECHAT_XPAY_SANDBOX_APPKEY' : '请先配置 WECHAT_XPAY_APPKEY',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  /**
   * 消息推送 Token。
   */
  getToken(): string {
    return this.configService.get<string>('wechatXpay.token') ?? '';
  }

  /**
   * EncodingAESKey。
   */
  getEncodingAesKey(): string {
    return this.configService.get<string>('wechatXpay.encodingAesKey') ?? '';
  }

  /**
   * 未启用时抛错。
   */
  assertEnabled(): void {
    if (!this.isEnabled()) {
      throw new HttpException('虚拟支付未启用（WECHAT_XPAY_ENABLED）', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 计算支付签名 pay_sig。
   *
   * @param uri 路径，如 /xpay/query_order；客户端固定 requestVirtualPayment
   * @param body 参与签名的字符串（与真实请求体一致）
   * @param env 环境
   */
  calcPaySig(uri: string, body: string, env: number = this.getEnv()): string {
    return createHmac('sha256', this.getAppKey(env))
      .update(`${uri}&${body}`)
      .digest('hex');
  }

  /**
   * 计算用户态签名。
   *
   * @param body 参与签名的字符串
   * @param sessionKey session_key
   */
  calcUserSignature(body: string, sessionKey: string): string {
    return createHmac('sha256', sessionKey).update(body).digest('hex');
  }

  /**
   * 调用 /xpay 接口。
   *
   * @param uri 路径，须以 /xpay 开头
   * @param payload POST JSON 对象
   * @param options.withPaySig 是否附带 pay_sig，默认 true
   */
  async post<T extends XpayApiResult>(
    uri: string,
    payload: Record<string, unknown>,
    options?: { withPaySig?: boolean },
  ): Promise<T> {
    this.assertEnabled();
    const body = JSON.stringify(payload);
    const accessToken = await this.wechatAccessTokenService.getStableAccessToken();
    const query = new URLSearchParams({ access_token: accessToken });
    if (options?.withPaySig !== false) {
      query.set('pay_sig', this.calcPaySig(uri, body, Number(payload.env ?? this.getEnv())));
    }
    const response = await fetch(`${WECHAT_API_BASE}${uri}?${query.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (!response.ok) {
      throw new HttpException('微信虚拟支付接口请求失败', HttpStatus.BAD_GATEWAY);
    }
    const data = (await response.json()) as T;
    if (data.errcode) {
      this.logger.warn(`xpay ${uri} 错误 ${data.errcode}: ${data.errmsg}`);
    throw new HttpException(
      `${data.errcode}:${data.errmsg || '虚拟支付接口错误'}`,
      HttpStatus.BAD_REQUEST,
    );
    }
    return data;
  }
}

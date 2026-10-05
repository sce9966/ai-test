import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from '../redisCache/redisCache.service';

const WECHAT_STABLE_TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/stable_token';
const STABLE_TOKEN_CACHE_KEY = 'wechat:mini:stable_access_token';
/** 官方有效期 7200 秒；普通模式会提前约 5 分钟更新，本地再提前缓存过期 */
const STABLE_TOKEN_CACHE_TTL = 7000;

/**
 * 稳定版 access_token 接口响应。
 */
interface StableAccessTokenResult {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信稳定版接口调用凭据服务（仅供服务端注入，不对外暴露 HTTP）。
 *
 * 与 {@link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/mp-access-token/getAccessToken.html getAccessToken}
 * 完全隔离；官方推荐使用本接口替代。
 *
 * @see https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-access-token/api_getstableaccesstoken.html
 */
@Injectable()
export class WechatAccessTokenService {
  private readonly logger = new Logger(WechatAccessTokenService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  /**
   * 读取小程序 AppId / AppSecret。
   */
  private getMiniConfig(): { appId: string; appSecret: string } {
    const appId = this.configService.get<string>('wechatMini.appId') ?? '';
    const appSecret = this.configService.get<string>('wechatMini.appSecret') ?? '';
    if (!appId || !appSecret) {
      throw new HttpException('请先配置微信小程序 AppId 与 AppSecret', HttpStatus.BAD_REQUEST);
    }
    return { appId, appSecret };
  }

  /**
   * 将稳定版 token 接口错误码转为业务异常。
   *
   * @param data 微信响应
   */
  private assertWechatOk(data: StableAccessTokenResult): void {
    if (!data.errcode) {
      return;
    }
    const messageMap: Record<number, string> = {
      [-1]: '微信系统繁忙，请稍后重试',
      40002: 'grant_type 不合法',
      40013: 'AppId 无效',
      40125: 'AppSecret 无效',
      40164: '调用 IP 不在白名单',
      41002: '缺少 appid',
      41004: '缺少 secret',
      43002: '需要使用 POST 请求',
      45009: '已超过当天调用额度',
      45011: '调用过于频繁，请稍后重试',
    };
    const message = messageMap[data.errcode] || data.errmsg || '获取稳定版 access_token 失败';
    this.logger.warn(`stable_token 错误 ${data.errcode}: ${data.errmsg}`);
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  /**
   * 向微信请求稳定版 access_token。
   *
   * @param forceRefresh 强制刷新（会使上次凭证失效，每天限用 20 次且需间隔 30 秒）
   */
  private async requestStableToken(forceRefresh: boolean): Promise<StableAccessTokenResult> {
    const { appId, appSecret } = this.getMiniConfig();
    const response = await fetch(WECHAT_STABLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: appId,
        secret: appSecret,
        force_refresh: forceRefresh,
      }),
    });
    if (!response.ok) {
      throw new HttpException('微信稳定版 token 接口请求失败', HttpStatus.BAD_GATEWAY);
    }
    return (await response.json()) as StableAccessTokenResult;
  }

  /**
   * 写入 Redis 缓存。官方要求存储空间至少保留 512 字符。
   *
   * @param accessToken 凭证
   * @param expiresIn 剩余有效秒数
   */
  private async cacheToken(accessToken: string, expiresIn?: number): Promise<void> {
    const ttl = Math.max(1, Math.min(expiresIn ?? STABLE_TOKEN_CACHE_TTL, STABLE_TOKEN_CACHE_TTL));
    await this.redisCacheService.set({ key: STABLE_TOKEN_CACHE_KEY, val: accessToken }, ttl);
  }

  /**
   * 获取稳定版接口调用凭据。普通模式下有效期内重复请求微信不会刷新 token。
   *
   * @param forceRefresh 是否强制刷新；默认 false（读缓存，缓存未命中再调微信）
   * @returns access_token
   */
  async getStableAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      const cached = await this.redisCacheService.get({ key: STABLE_TOKEN_CACHE_KEY });
      if (cached) {
        return cached;
      }
    }

    const data = await this.requestStableToken(forceRefresh);
    this.assertWechatOk(data);
    if (!data.access_token) {
      throw new HttpException('获取稳定版 access_token 失败', HttpStatus.BAD_GATEWAY);
    }
    await this.cacheToken(data.access_token, data.expires_in);
    return data.access_token;
  }
}

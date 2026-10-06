import { createHmac } from 'crypto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Result } from '../../common/result';
import { createRandomUid } from '../../common/utils/createRandomUid';
import { getClientIp } from '../../common/utils/getClientIp';
import { User } from '../entity/user/user.entity';
import { RedisCacheService } from '../redisCache/redisCache.service';
import { WechatAccessTokenService } from './wechat-access-token.service';
import { WechatMiniLoginDto } from './dto/wechat-mini.dto';

const WECHAT_API_BASE = 'https://api.weixin.qq.com';
const SESSION_KEY_PREFIX = 'wechat:mini:session:';
/** session_key 缓存秒数（与常见 JWT 周期对齐，最长 7 天） */
const SESSION_KEY_TTL = 7 * 24 * 60 * 60;

/**
 * 微信 code2Session 响应。
 */
interface Code2SessionResult {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 微信通用 JSON 响应。
 */
interface WechatApiResult {
  errcode?: number;
  errmsg?: string;
  access_token?: string;
  expires_in?: number;
  openid?: string;
  session_key?: string;
}

/**
 * 微信小程序服务：登录凭证校验、登录态检查与重置。
 *
 * @see https://developers.weixin.qq.com/miniprogram/dev/server/API/user-login/
 */
@Injectable()
export class WechatMiniService {
  private readonly logger = new Logger(WechatMiniService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisCacheService: RedisCacheService,
    private readonly wechatAccessTokenService: WechatAccessTokenService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 读取并校验小程序 AppId / AppSecret。
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
   * 请求微信开放接口。
   *
   * @param path 路径（含 query）
   * @param init fetch 选项
   */
  private async requestWechat<T extends WechatApiResult>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${WECHAT_API_BASE}${path}`, init);
    if (!response.ok) {
      throw new HttpException('微信接口请求失败', HttpStatus.BAD_GATEWAY);
    }
    return (await response.json()) as T;
  }

  /**
   * 将微信错误码转为可读异常。
   *
   * @param data 微信响应
   * @param fallback 默认文案
   */
  private assertWechatOk(data: WechatApiResult, fallback: string): void {
    if (!data.errcode) {
      return;
    }
    const messageMap: Record<number, string> = {
      [-1]: '微信系统繁忙，请稍后重试',
      40013: 'AppId 无效',
      40029: '登录凭证 code 无效或已过期',
      40163: 'code 已被使用',
      40226: '高风险用户，登录被拦截',
      45011: '调用过于频繁，请稍后重试',
      87009: '登录态签名无效',
    };
    const message = messageMap[data.errcode] || data.errmsg || fallback;
    this.logger.warn(`微信接口错误 ${data.errcode}: ${data.errmsg}`);
    throw new HttpException(message, HttpStatus.BAD_REQUEST);
  }

  /**
   * 用 session_key 对空字符串做 HMAC-SHA256，供 checksession / resetusersessionkey。
   *
   * @param sessionKey 微信 session_key
   */
  private signEmptyPayload(sessionKey: string): string {
    return createHmac('sha256', sessionKey).update('').digest('hex');
  }

  /**
   * 缓存微信 session_key（切勿下发给客户端）。
   *
   * @param openId 用户 openId
   * @param sessionKey session_key
   */
  private async saveSessionKey(openId: string, sessionKey: string): Promise<void> {
    await this.redisCacheService.set(
      { key: `${SESSION_KEY_PREFIX}${openId}`, val: sessionKey },
      SESSION_KEY_TTL,
    );
  }

  /**
   * 读取已缓存的 session_key。
   *
   * @param openId 用户 openId
   */
  private async getSessionKey(openId: string): Promise<string> {
    const sessionKey = await this.redisCacheService.get({
      key: `${SESSION_KEY_PREFIX}${openId}`,
    });
    if (!sessionKey) {
      throw new HttpException('小程序登录态已失效，请重新登录', HttpStatus.UNAUTHORIZED);
    }
    return sessionKey;
  }

  /**
   * 对外提供当前用户缓存的 session_key（用于虚拟支付用户态签名）。
   *
   * @param openId 用户 openId
   */
  async requireSessionKey(openId: string): Promise<string> {
    return this.getSessionKey(openId);
  }

  /**
   * 获取稳定版接口调用凭据（供本模块其它微信接口使用）。
   *
   * @param forceRefresh 是否强制刷新
   */
  async getAccessToken(forceRefresh = false): Promise<string> {
    return this.wechatAccessTokenService.getStableAccessToken(forceRefresh);
  }

  /**
   * 登录凭证校验：js_code 换 openid / session_key。
   *
   * @param jsCode wx.login 得到的 code
   * @see https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
   */
  async code2Session(jsCode: string): Promise<Required<Pick<Code2SessionResult, 'openid' | 'session_key'>> & {
    unionid?: string;
  }> {
    const { appId, appSecret } = this.getMiniConfig();
    const query = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: jsCode,
      grant_type: 'authorization_code',
    });
    const data = await this.requestWechat<Code2SessionResult>(
      `/sns/jscode2session?${query.toString()}`,
    );
    this.assertWechatOk(data, '微信登录凭证校验失败');
    if (!data.openid || !data.session_key) {
      throw new HttpException('微信登录凭证校验失败', HttpStatus.BAD_GATEWAY);
    }
    return {
      openid: data.openid,
      session_key: data.session_key,
      unionid: data.unionid,
    };
  }

  /**
   * 按 openId 查找或创建小程序用户。
   *
   * @param openId 微信 openId
   * @param unionId 微信 unionId
   * @param ip 客户端 IP
   */
  private async upsertMiniUser(openId: string, unionId: string | undefined, ip: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { openId } });
    if (user) {
      user.lastLoginIp = ip || user.lastLoginIp;
      if (unionId) {
        user.unionId = unionId;
      }
      return this.userRepository.save(user);
    }

    user = this.userRepository.create({
      username: `wx_${createRandomUid(9)}`,
      openId,
      unionId: unionId ?? '',
      client: 'wechat-mini',
      registerIp: ip,
      lastLoginIp: ip,
      status: 1,
    });
    return this.userRepository.save(user);
  }

  /**
   * 小程序登录：校验 js_code，签发业务 JWT。
   *
   * @param dto 登录 DTO
   * @param req 请求（解析 IP）
   */
  async login(dto: WechatMiniLoginDto, req: Request) {
    const session = await this.code2Session(dto.code);
    await this.saveSessionKey(session.openid, session.session_key);
    const user = await this.upsertMiniUser(session.openid, session.unionid, getClientIp(req));
    const { username, id, email, openId, client, phone, avatar } = user;
    const accessToken = await this.jwtService.signAsync({
      username,
      id,
      email,
      openId,
      client,
      phone,
    });
    await this.redisCacheService.saveToken(id, accessToken);
    return Result.success(
      {
        user: { id, username, avatar, openId },
        accessToken,
      },
      '登录成功',
    );
  }

  /**
   * 检验服务器保存的 session_key 是否仍有效。
   *
   * @param userId 当前用户
   * @see https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/checkSessionKey.html
   */
  async checkSession(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.openId) {
      throw new HttpException('当前账号未绑定微信', HttpStatus.BAD_REQUEST);
    }
    const sessionKey = await this.getSessionKey(user.openId);
    const accessToken = await this.getAccessToken();
    const query = new URLSearchParams({
      access_token: accessToken,
      openid: user.openId,
      signature: this.signEmptyPayload(sessionKey),
      sig_method: 'hmac_sha256',
    });
    const data = await this.requestWechat<WechatApiResult>(`/wxa/checksession?${query.toString()}`);
    this.assertWechatOk(data, '检验登录态失败');
    return Result.success({ valid: true }, '登录态有效');
  }

  /**
   * 重置指定用户的 session_key，并刷新服务端缓存。
   *
   * @param userId 当前用户
   * @see https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/ResetUserSessionKey.html
   */
  async resetSession(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.openId) {
      throw new HttpException('当前账号未绑定微信', HttpStatus.BAD_REQUEST);
    }
    const sessionKey = await this.getSessionKey(user.openId);
    const accessToken = await this.getAccessToken();
    const query = new URLSearchParams({
      access_token: accessToken,
      openid: user.openId,
      signature: this.signEmptyPayload(sessionKey),
      sig_method: 'hmac_sha256',
    });
    const data = await this.requestWechat<WechatApiResult>(
      `/wxa/resetusersessionkey?${query.toString()}`,
    );
    this.assertWechatOk(data, '重置登录态失败');
    if (!data.session_key) {
      throw new HttpException('重置登录态失败', HttpStatus.BAD_GATEWAY);
    }
    await this.saveSessionKey(user.openId, data.session_key);
    return Result.success({ reset: true }, '登录态已重置');
  }
}

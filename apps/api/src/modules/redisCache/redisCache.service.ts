import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { RedisClientType } from 'redis';
import { JwtPayload } from '../../common/interfaces/jwt-payload';

/**
 * Redis 缓存服务：键值读写与登录 Token 管理。
 */
@Injectable()
export class RedisCacheService implements OnModuleInit {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType) {}

  /**
   * 模块初始化钩子（预留配置扩展）。
   */
  async onModuleInit(): Promise<void> {
    // no-op
  }

  /**
   * 读取缓存。
   *
   * @param body 包含 key 的对象
   */
  async get(body: { key: string }): Promise<string | null> {
    const { key } = body;
    return this.redisClient.get(key);
  }

  /**
   * 写入缓存，可选过期时间（秒）。
   *
   * @param body 键值对
   * @param time 过期秒数
   */
  async set(body: { key: string; val: string }, time?: number): Promise<void> {
    try {
      const { key, val } = body;
      await this.redisClient.set(key, val);
      if (time) {
        await this.redisClient.expire(key, time);
      }
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Redis set failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 获取 key 剩余 TTL（秒）。
   *
   * @param key Redis key
   */
  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  /**
   * 删除缓存。
   *
   * @param body 包含 key 的对象
   */
  async del(body: { key: string }): Promise<void> {
    const { key } = body;
    await this.redisClient.del(key);
  }

  /**
   * 登录时保存用户 Token（覆盖旧 Token，实现单点登录）。
   *
   * @param userId 用户 ID
   * @param token JWT 字符串
   */
  async saveToken(userId: number, token: string): Promise<void> {
    const tokens = await this.redisClient.zRange(`tokens:${userId}`, 0, -1);
    await this.invalidateTokens(userId, tokens);
    await this.redisClient.set(`token:${userId}`, token);
  }

  /**
   * 移除用户历史 Token。
   *
   * @param userId 用户 ID
   * @param tokens Token 列表
   */
  async invalidateTokens(userId: number, tokens: string[]): Promise<void> {
    for (const token of tokens) {
      await this.redisClient.del(`token:${userId}:${token}`);
    }
  }

  /**
   * 校验请求 Token 是否与 Redis 中记录一致。
   *
   * @param token 当前请求 Token
   * @param req Express 请求（需已挂载 user）
   */
  async checkTokenAuth(token: string, req: Request): Promise<boolean> {
    const user = req.user as JwtPayload | undefined;
    if (!user?.id) {
      throw new HttpException('未授权', HttpStatus.UNAUTHORIZED);
    }

    const { id: userId, role } = user;
    if (role === 'visitor') {
      return true;
    }

    const storedToken = await this.redisClient.get(`token:${userId}`);

    if (storedToken === null) {
      await this.redisClient.set(`token:${userId}`, token);
      return true;
    }

    if (storedToken !== token) {
      if (role && ['super', 'admin'].includes(role)) {
        return true;
      }
      throw new HttpException('您已在其他设备覆盖登录、请您重新登录！', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}

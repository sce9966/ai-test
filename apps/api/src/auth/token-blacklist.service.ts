import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * Redis Token 黑名单：登出后将 jti 写入，TTL 与 Token 剩余寿命对齐。
 *
 * Key 设计：`auth:blacklist:{jti}` → `"1"`，过期后自动清理。
 */
@Injectable()
export class TokenBlacklistService {
  /** Redis key 前缀 */
  private static readonly KEY_PREFIX = 'auth:blacklist:';

  constructor(private readonly redisService: RedisService) {}

  /**
   * 构造黑名单 key。
   *
   * @param jti Token 唯一标识
   * @returns Redis key
   */
  private buildKey(jti: string): string {
    return `${TokenBlacklistService.KEY_PREFIX}${jti}`;
  }

  /**
   * 将 Token 加入黑名单。
   *
   * @param jti Token 唯一标识
   * @param ttlSeconds 剩余有效秒数（至少 1）
   */
  async add(jti: string, ttlSeconds: number): Promise<void> {
    const ttl = Math.max(1, Math.floor(ttlSeconds));
    await this.redisService.getClient().set(this.buildKey(jti), '1', 'EX', ttl);
  }

  /**
   * 判断 Token 是否已吊销。
   *
   * @param jti Token 唯一标识
   * @returns 是否在黑名单中
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const value = await this.redisService.getClient().get(this.buildKey(jti));
    return value !== null;
  }
}

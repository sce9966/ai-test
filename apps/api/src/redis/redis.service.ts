import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Redis 访问封装：提供 ping 等基础能力，供健康检查与后续会话/缓存使用。
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  /**
   * 获取底层 ioredis 客户端。
   *
   * @returns Redis 客户端实例
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 对 Redis 执行 PING。
   *
   * @returns 响应字符串（正常为 `PONG`）
   */
  async ping(): Promise<string> {
    return this.client.ping();
  }

  /**
   * 模块销毁时关闭连接，避免进程残留。
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}

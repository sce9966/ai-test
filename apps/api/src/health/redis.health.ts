import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

/**
 * Redis 健康检查指示器：通过 PING 判断缓存是否可达。
 */
@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 执行 Redis ping 健康检查。
   *
   * @param key 健康检查结果中的键名
   * @returns Terminus 健康检查结果
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      const pong = await this.redisService.ping();
      if (pong !== 'PONG') {
        return indicator.down({ message: `unexpected ping response: ${pong}` });
      }
      return indicator.up({ ping: pong });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'redis unreachable';
      return indicator.down({ message });
    }
  }
}

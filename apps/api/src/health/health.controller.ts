import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

/**
 * 健康检查控制器：报告进程存活及 MySQL / Redis 连通性。
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  /**
   * 综合健康检查（服务存活 + MySQL + Redis）。
   *
   * @returns Terminus 健康检查结果
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }

  /**
   * 存活探针：仅确认 HTTP 进程可响应（不依赖外部依赖）。
   *
   * @returns 存活状态
   */
  @Get('live')
  live(): { status: string } {
    return { status: 'ok' };
  }
}

import { registerAs } from '@nestjs/config';

/**
 * Redis 连接配置命名空间。
 */
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));

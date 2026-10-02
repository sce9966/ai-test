import { registerAs } from '@nestjs/config';

/**
 * Redis 连接配置。
 */
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USER || undefined,
  db: parseInt(process.env.REDIS_DB ?? '0', 10),
}));

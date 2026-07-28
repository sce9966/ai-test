import { registerAs } from '@nestjs/config';

/**
 * MySQL 连接占位配置（本 Issue 不接线 TypeORM；供后续基础设施 Issue 使用）。
 */
export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'admin_template',
}));

import { registerAs } from '@nestjs/config';

/**
 * MySQL / TypeORM 连接配置命名空间。
 */
export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3307', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? 'change_me',
  database: process.env.DB_DATABASE ?? 'admin_template',
  /**
   * 仅允许在 development 显式开启；生产必须走 Migration。
   */
  synchronize:
    process.env.NODE_ENV === 'development' &&
    (process.env.DB_SYNCHRONIZE === 'true' || process.env.DB_SYNCHRONIZE === '1'),
}));

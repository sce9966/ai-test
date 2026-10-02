import { registerAs } from '@nestjs/config';

/**
 * MySQL 连接配置。
 */
export default registerAs('database', () => ({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '',
  database: process.env.DB_DATABASE ?? 'openkey',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
}));

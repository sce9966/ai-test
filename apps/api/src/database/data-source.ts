import { DataSource } from 'typeorm';
import { resolve } from 'node:path';

/**
 * TypeORM CLI DataSource（仅用于 migration 生成/执行，不用于 Nest 运行时）。
 * 执行前请先导出或加载 `apps/api/.env` 中的 DB_* 变量。
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? 'change_me',
  database: process.env.DB_DATABASE ?? 'admin_template',
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, './migrations/*{.ts,.js}')],
});

/**
 * 应用运行时常量（端口 / API 前缀 / Swagger / 命名空间）。
 */
export const PORT = Number(process.env.PORT) || 3000;
export const SWAGGERPREFIX = process.env.SWAGGERPREFIX || '/docs';
export const APIPREFIX = process.env.APIPREFIX || '/api';
export const NAMESPACE = process.env.NAMESPACE || 'openkey';

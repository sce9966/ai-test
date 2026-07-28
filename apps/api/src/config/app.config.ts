import { registerAs } from '@nestjs/config';

/**
 * 应用运行时配置命名空间（端口与环境）。
 */
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
}));

import { registerAs } from '@nestjs/config';

/**
 * JWT 鉴权配置命名空间（密钥与过期时间均来自环境变量）。
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'change_me_jwt_secret',
  /**
   * Access Token 过期时间（如 `2h`、`7d`），供 @nestjs/jwt 解析。
   */
  expiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
}));

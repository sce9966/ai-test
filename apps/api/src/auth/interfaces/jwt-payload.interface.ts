/**
 * JWT Access Token 载荷结构（签发与校验共用）。
 */
export interface JwtPayload {
  /** 用户 ID（subject） */
  sub: string;
  /** 租户 ID（行级隔离上下文，仅来自鉴权结果） */
  tenantId: string;
  /** 登录用户名 */
  username: string;
  /** Token 唯一标识，用于 Redis 黑名单吊销 */
  jti: string;
  /** 过期时间（Unix 秒，由 JWT 库自动附加） */
  exp?: number;
  /** 签发时间（Unix 秒） */
  iat?: number;
}

/**
 * 注入到请求上的当前用户视图（不含敏感字段）。
 */
export interface JwtPayloadUser {
  /** 用户 ID */
  userId: string;
  /** 租户 ID */
  tenantId: string;
  /** 登录用户名 */
  username: string;
  /** Token jti */
  jti: string;
  /** 过期时间（Unix 秒），用于登出黑名单 TTL */
  exp?: number;
}

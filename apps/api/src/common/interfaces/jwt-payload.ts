/**
 * JWT Payload 结构。
 */
export interface JwtPayload {
  /** 用户 ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email?: string;
  /** 微信 openId */
  openId?: string;
  /** 注册来源 */
  client?: string;
  /** 手机号 */
  phone?: string;
  /** 租户 ID */
  tenantId?: string;
  /** 角色标识 */
  role?: string;
}

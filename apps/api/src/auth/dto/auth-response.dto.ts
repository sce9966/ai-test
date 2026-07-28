/**
 * 登录成功响应。
 */
export class LoginResponseDto {
  /**
   * Access Token（Bearer）。
   */
  accessToken!: string;

  /**
   * Token 类型，固定为 Bearer。
   */
  tokenType!: 'Bearer';

  /**
   * 过期秒数（便于前端设置刷新/过期提示）。
   */
  expiresIn!: number;

  /**
   * 当前用户摘要。
   */
  user!: CurrentUserResponseDto;
}

/**
 * 当前用户响应（脱敏）。
 */
export class CurrentUserResponseDto {
  /**
   * 用户 ID。
   */
  id!: string;

  /**
   * 租户 ID。
   */
  tenantId!: string;

  /**
   * 登录用户名。
   */
  username!: string;

  /**
   * 显示名称。
   */
  displayName!: string;
}

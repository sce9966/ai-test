/**
 * 当前用户权限包响应。
 */
export class UserPermissionsResponseDto {
  /**
   * 用户 ID。
   */
  userId!: string;

  /**
   * 租户 ID。
   */
  tenantId!: string;

  /**
   * 角色编码列表。
   */
  roles!: string[];

  /**
   * 权限码列表（用户经角色继承后的并集）。
   */
  permissions!: string[];
}

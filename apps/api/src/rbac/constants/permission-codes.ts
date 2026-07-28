/**
 * 稳定可枚举的权限码常量（前后端对齐；变更时需兼顾兼容）。
 */
export const PermissionCodes = {
  /** 用户列表 */
  UserList: 'system:user:list',
  /** 用户新建 */
  UserCreate: 'system:user:create',
  /** 用户编辑 */
  UserUpdate: 'system:user:update',
  /** 用户禁用/删除 */
  UserDelete: 'system:user:delete',
  /** 角色列表 */
  RoleList: 'system:role:list',
  /** 角色新建 */
  RoleCreate: 'system:role:create',
  /** 角色编辑 */
  RoleUpdate: 'system:role:update',
  /** 角色删除 */
  RoleDelete: 'system:role:delete',
  /** 菜单列表 */
  MenuList: 'system:menu:list',
  /** 菜单新建 */
  MenuCreate: 'system:menu:create',
  /** 菜单编辑 */
  MenuUpdate: 'system:menu:update',
  /** 菜单删除 */
  MenuDelete: 'system:menu:delete',
  /** RBAC 演示受保护接口（验收 403 用） */
  RbacDemoPing: 'rbac:demo:ping',
} as const;

/**
 * 权限码联合类型。
 */
export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];

/**
 * 全部内置权限码列表（种子与校验用）。
 */
export const ALL_PERMISSION_CODES: readonly PermissionCode[] = Object.values(PermissionCodes);

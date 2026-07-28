/**
 * 权限码工具：与后端 `permissions.code` / `@RequirePermissions` 对齐。
 *
 * 约定：
 * - 权限码形如 `system:user:list`
 * - 登录后调用 `GET /rbac/me/permissions` 或使用 `/auth/me` 中的 `permissions` 写入本模块
 * - 组件级：优先 `v-permission`；组合式场景用 `hasPermission` / `hasAnyPermission`
 */

/** 当前会话权限码集合（由 store 或登录流程写入） */
let currentPermissionCodes: ReadonlySet<string> = new Set()

/**
 * 设置当前用户权限码（登录成功 / 拉取权限后调用）。
 *
 * @param codes 权限码列表
 */
export function setPermissionCodes(codes: readonly string[]): void {
  currentPermissionCodes = new Set(codes)
}

/**
 * 清空权限码（登出时调用）。
 */
export function clearPermissionCodes(): void {
  currentPermissionCodes = new Set()
}

/**
 * 读取当前权限码快照。
 *
 * @returns 权限码数组
 */
export function getPermissionCodes(): string[] {
  return [...currentPermissionCodes].sort()
}

/**
 * 是否具备指定权限码。
 *
 * @param code 权限码
 * @returns 是否具备
 */
export function hasPermission(code: string): boolean {
  return currentPermissionCodes.has(code)
}

/**
 * 是否具备任一权限码。
 *
 * @param codes 权限码列表
 * @returns 是否至少具备一个
 */
export function hasAnyPermission(codes: readonly string[]): boolean {
  return codes.some((code) => currentPermissionCodes.has(code))
}

/**
 * 是否具备全部权限码。
 *
 * @param codes 权限码列表
 * @returns 是否全部具备
 */
export function hasAllPermissions(codes: readonly string[]): boolean {
  return codes.every((code) => currentPermissionCodes.has(code))
}

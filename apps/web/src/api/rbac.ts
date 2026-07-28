import { http } from './http'

/**
 * 当前用户权限包（与后端 `GET /rbac/me/permissions` 对齐）。
 */
export interface UserPermissionsPayload {
  /** 用户 ID */
  userId: string
  /** 租户 ID */
  tenantId: string
  /** 角色编码 */
  roles: string[]
  /** 权限码列表 */
  permissions: string[]
}

/**
 * 拉取当前登录用户的权限码列表。
 *
 * @returns 权限包
 */
export function fetchMyPermissions() {
  return http.get<UserPermissionsPayload>('/rbac/me/permissions')
}

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchMyPermissions } from '@/api/rbac'
import {
  clearPermissionCodes,
  getPermissionCodes,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  setPermissionCodes,
} from '@/utils/permission'

/**
 * 权限 Pinia Store：缓存当前用户权限码，供指令与页面共用。
 */
export const usePermissionStore = defineStore('permission', () => {
  const loaded = ref(false)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  const permissionSet = computed(() => new Set(permissions.value))

  /**
   * 从后端拉取并写入权限码。
   */
  async function loadPermissions(): Promise<void> {
    const { data: payload } = await fetchMyPermissions()
    roles.value = payload.roles
    permissions.value = payload.permissions
    setPermissionCodes(payload.permissions)
    loaded.value = true
  }

  /**
   * 使用已有权限列表写入（例如登录响应中的 `user.permissions`）。
   *
   * @param codes 权限码
   * @param roleCodes 角色编码
   */
  function setFromCodes(codes: readonly string[], roleCodes: readonly string[] = []): void {
    permissions.value = [...codes]
    roles.value = [...roleCodes]
    setPermissionCodes(codes)
    loaded.value = true
  }

  /**
   * 清空权限状态。
   */
  function reset(): void {
    roles.value = []
    permissions.value = []
    clearPermissionCodes()
    loaded.value = false
  }

  return {
    loaded,
    roles,
    permissions,
    permissionSet,
    loadPermissions,
    setFromCodes,
    reset,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionCodes,
  }
})

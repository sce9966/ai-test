import type { App, Directive, DirectiveBinding } from 'vue'
import { hasAllPermissions, hasAnyPermission, hasPermission } from '@/utils/permission'

/**
 * `v-permission` 指令值：单个权限码、权限码数组，或配置对象。
 *
 * - 字符串：需具备该权限
 * - 数组：默认需全部具备（AND）；配合 `{ any: true }` 为任一即可
 */
export type PermissionDirectiveValue =
  | string
  | string[]
  | {
      /** 权限码列表 */
      codes: string[]
      /** 为 true 时只需任一权限（OR） */
      any?: boolean
    }

/**
 * 解析指令值是否通过权限校验。
 *
 * @param value 指令绑定值
 * @returns 是否有权限
 */
function checkPermissionValue(value: PermissionDirectiveValue | undefined): boolean {
  if (value == null || value === '') {
    return true
  }
  if (typeof value === 'string') {
    return hasPermission(value)
  }
  if (Array.isArray(value)) {
    return hasAllPermissions(value)
  }
  if (value.any) {
    return hasAnyPermission(value.codes)
  }
  return hasAllPermissions(value.codes)
}

/**
 * 无权限时从 DOM 移除节点（组件级控制骨架）。
 */
const permissionDirective: Directive<HTMLElement, PermissionDirectiveValue> = {
  /**
   * @param el 元素
   * @param binding 绑定
   */
  mounted(el, binding) {
    applyPermission(el, binding)
  },
  /**
   * @param el 元素
   * @param binding 绑定
   */
  updated(el, binding) {
    applyPermission(el, binding)
  },
}

/**
 * 根据权限决定是否移除元素。
 *
 * @param el 元素
 * @param binding 绑定
 */
function applyPermission(
  el: HTMLElement,
  binding: DirectiveBinding<PermissionDirectiveValue>,
): void {
  if (!checkPermissionValue(binding.value)) {
    el.parentNode?.removeChild(el)
  }
}

/**
 * 注册 `v-permission` 全局指令。
 *
 * @param app Vue 应用实例
 * @example
 * ```vue
 * <button v-permission="'system:user:create'">新建</button>
 * <button v-permission="['system:user:update', 'system:user:delete']">批量</button>
 * <button v-permission="{ codes: ['a', 'b'], any: true }">任一</button>
 * ```
 */
export function setupPermissionDirective(app: App): void {
  app.directive('permission', permissionDirective)
}

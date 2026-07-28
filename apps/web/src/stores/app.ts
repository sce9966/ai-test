import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 应用级布局状态：标题与侧栏偏好等，供顶栏 / 侧栏读取。
 */
export const useAppStore = defineStore('app', () => {
  const title = ref(import.meta.env.VITE_APP_TITLE || 'Admin Template')
  const sidebarCollapsed = ref(false)

  const documentTitlePrefix = computed(() => title.value)

  /**
   * 切换侧栏折叠偏好（与 SidebarProvider 并存，供业务扩展）。
   */
  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    title,
    sidebarCollapsed,
    documentTitlePrefix,
    toggleSidebarCollapsed,
  }
})

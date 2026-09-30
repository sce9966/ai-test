import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 布局相关全局状态：侧边栏折叠、主题等。
 */
export const useLayoutStore = defineStore('layout', () => {
  const sidebarCollapsed = ref(false)
  const isDark = ref(false)

  const sidebarWidth = computed(() => (sidebarCollapsed.value ? '64px' : '224px'))

  /**
   * 切换侧边栏折叠状态。
   */
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 切换浅色 / 深色主题。
   */
  function toggleTheme() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  /**
   * 根据 document 同步当前主题状态。
   */
  function syncThemeFromDom() {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  return {
    sidebarCollapsed,
    isDark,
    sidebarWidth,
    toggleSidebar,
    toggleTheme,
    syncThemeFromDom,
  }
})

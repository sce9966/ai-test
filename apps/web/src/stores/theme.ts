import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  applyTheme,
  DEFAULT_THEME,
  persistTheme,
  readStoredTheme,
  THEMES,
  type ThemeId,
} from '@/themes'

/**
 * 主题偏好 Store：在 html 上切换 class，并持久化到 localStorage。
 */
export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeId>(DEFAULT_THEME)

  const currentLabel = computed(
    () => THEMES.find((item) => item.id === theme.value)?.label ?? theme.value,
  )

  /**
   * 从 localStorage 恢复并应用到文档根节点（应用启动时调用一次）。
   */
  function initTheme() {
    const next = readStoredTheme()
    theme.value = next
    applyTheme(next)
  }

  /**
   * 切换主题并写入 localStorage。
   */
  function setTheme(next: ThemeId) {
    theme.value = next
    applyTheme(next)
    persistTheme(next)
  }

  return {
    theme,
    themes: THEMES,
    currentLabel,
    initTheme,
    setTheme,
  }
})

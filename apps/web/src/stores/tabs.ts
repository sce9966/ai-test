import type { Component } from 'vue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * 多页签项。
 */
export interface TabItem {
  /** 路由 path */
  path: string
  /** 路由 name */
  name?: string | symbol | null
  /** 页签标题 */
  title: string
  /** 页签图标 */
  icon?: Component
  /** 是否固定（不可关闭） */
  affix?: boolean
}

/**
 * 从路由匹配链中解析可用图标。
 */
function resolveTabIcon(route: RouteLocationNormalizedLoaded): Component | undefined {
  if (route.meta.icon) return route.meta.icon

  for (let i = route.matched.length - 1; i >= 0; i -= 1) {
    const icon = route.matched[i]?.meta.icon
    if (icon) return icon
  }

  return undefined
}

/**
 * 多页签状态：记录已打开页面并同步当前激活页签。
 */
export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([])
  const activePath = ref('')

  const hasTabs = computed(() => tabs.value.length > 0)

  /**
   * 根据路由打开或激活对应页签。
   */
  function openTab(route: RouteLocationNormalizedLoaded) {
    const path = route.path
    const title =
      typeof route.meta.title === 'string' && route.meta.title ? route.meta.title : path
    const affix = route.meta.affix === true
    const icon = resolveTabIcon(route)

    activePath.value = path

    const existing = tabs.value.find((tab) => tab.path === path)
    if (existing) {
      existing.title = title
      existing.icon = icon
      return
    }

    tabs.value.push({
      path,
      name: route.name,
      title,
      icon,
      affix,
    })
  }

  /**
   * 关闭指定页签；若关闭当前页，返回应跳转的路径。
   */
  function closeTab(path: string): string | null {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index === -1) return null

    const target = tabs.value[index]
    if (target?.affix) return null

    const wasActive = activePath.value === path
    tabs.value.splice(index, 1)

    if (!wasActive) return null

    const next = tabs.value[index] ?? tabs.value[index - 1]
    return next?.path ?? null
  }

  /**
   * 清空全部页签状态。
   */
  function resetTabs() {
    tabs.value = []
    activePath.value = ''
  }

  return {
    tabs,
    activePath,
    hasTabs,
    openTab,
    closeTab,
    resetTabs,
  }
})

import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '@/router/routes'

/**
 * 侧边栏菜单项定义（支持多级）。
 */
export interface AppMenuItem {
  /** 完整路由 path */
  path: string
  /** 菜单标题 */
  title: string
  /** 菜单图标 */
  icon?: Component
  /** 子菜单 */
  children?: AppMenuItem[]
}

/**
 * 拼接父子路由 path 为绝对路径。
 */
function resolveRoutePath(parentPath: string, routePath: string): string {
  if (!routePath) return parentPath || '/'
  if (routePath.startsWith('/')) return routePath

  const base = parentPath === '/' ? '' : parentPath.replace(/\/$/, '')
  return `${base}/${routePath}`.replace(/\/+/g, '/')
}

/**
 * 将路由 children 映射为菜单树。
 */
function mapRoutesToMenus(routeList: RouteRecordRaw[], parentPath: string): AppMenuItem[] {
  const menus: AppMenuItem[] = []

  for (const route of routeList) {
    if (route.meta?.hideInMenu) continue

    const path = resolveRoutePath(parentPath, route.path)
    const childMenus = route.children?.length
      ? mapRoutesToMenus(route.children, path)
      : []

    // 无标题的中间节点：直接提升可见子菜单
    if (!route.meta?.title) {
      menus.push(...childMenus)
      continue
    }

    const menu: AppMenuItem = {
      path,
      title: route.meta.title,
      icon: route.meta.icon,
    }

    if (childMenus.length) {
      menu.children = childMenus
    }

    menus.push(menu)
  }

  return menus
}

/**
 * 根据路由层级关系映射生成侧边栏菜单。
 */
export function generateMenus(routeList: RouteRecordRaw[] = routes): AppMenuItem[] {
  const layoutRoute = routeList.find((item) => item.path === '/' && item.children?.length)
  if (!layoutRoute?.children?.length) return []
  return mapRoutesToMenus(layoutRoute.children, '/')
}

/**
 * 应用侧边栏菜单（由路由表映射生成）。
 */
export const appMenus = generateMenus(routes)

/**
 * 判断菜单或其子孙是否匹配当前路由。
 */
export function isMenuActive(item: AppMenuItem, currentPath: string): boolean {
  if (currentPath === item.path || currentPath.startsWith(`${item.path}/`)) {
    return true
  }
  return item.children?.some((child) => isMenuActive(child, currentPath)) ?? false
}

/**
 * 解析当前路由对应的面包屑链路。
 */
export function resolveBreadcrumbs(menus: AppMenuItem[], currentPath: string): AppMenuItem[] {
  for (const item of menus) {
    if (item.children?.length) {
      const childTrail = resolveBreadcrumbs(item.children, currentPath)
      if (childTrail.length) {
        return [item, ...childTrail]
      }
    }

    if (currentPath === item.path || currentPath.startsWith(`${item.path}/`)) {
      return [item]
    }
  }

  return []
}

/**
 * 收集菜单树中所有叶子节点 path。
 */
export function collectLeafPaths(menus: AppMenuItem[]): string[] {
  const paths: string[] = []

  for (const item of menus) {
    if (item.children?.length) {
      paths.push(...collectLeafPaths(item.children))
    } else {
      paths.push(item.path)
    }
  }

  return paths
}

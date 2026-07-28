import type { Component } from 'vue'
import { HomeIcon, InfoIcon } from '@lucide/vue'

/**
 * 侧栏静态菜单项（动态菜单 / 权限由后续 Stage 叠加）。
 */
export interface NavItem {
  /** 菜单标题 */
  title: string
  /** 路由 name，与 Vue Router 对齐 */
  name: string
  /** 路由 path */
  to: string
  /** Lucide 图标组件 */
  icon: Component
}

/**
 * 布局壳默认导航：占位首页 + 示例页（验证面包屑与侧栏激活态）。
 */
export const mainNavItems: NavItem[] = [
  {
    title: '首页',
    name: 'home',
    to: '/',
    icon: HomeIcon,
  },
  {
    title: '关于',
    name: 'about',
    to: '/about',
    icon: InfoIcon,
  },
]

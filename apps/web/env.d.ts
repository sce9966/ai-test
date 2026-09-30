/// <reference types="vite/client" />

/**
 * Vite 注入的前端环境变量（与 `.env.example` 对齐）。
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT_MS: string
  readonly VITE_API_TOKEN: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import type { Component } from 'vue'
import 'vue-router'

declare module 'vue-router' {
  /**
   * 路由元信息扩展。
   */
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 侧边栏图标 */
    icon?: Component
    /** 是否固定页签（不可关闭） */
    affix?: boolean
    /** 是否不使用基础布局 */
    layout?: false
    /** 是否在侧边栏隐藏 */
    hideInMenu?: boolean
    /** 是否为公开路由（无需登录） */
    public?: boolean
  }
}

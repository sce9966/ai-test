export {}

declare module 'vue-router' {
  /**
   * 路由元信息：页面标题用于 document.title 与面包屑。
   */
  interface RouteMeta {
    title?: string
  }
}

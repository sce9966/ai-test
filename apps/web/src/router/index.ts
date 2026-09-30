import { createRouter, createWebHashHistory } from 'vue-router'
import { setupRouterGuard } from './guard'
import { routes } from './routes'

/**
 * 前端路由实例。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setupRouterGuard(router)

router.afterEach((to) => {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'Admin Template'
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : undefined
  document.title = pageTitle ? `${pageTitle} · ${appTitle}` : appTitle
})

export default router

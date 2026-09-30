import type { Router } from 'vue-router'
import { hasAccessToken } from '@/utils/auth'

/**
 * 注册全局路由守卫：无 accessToken 时跳转登录页。
 */
export function setupRouterGuard(router: Router) {
  router.beforeEach((to) => {
    const isPublic = to.meta.public === true || to.meta.layout === false
    const loggedIn = hasAccessToken()

    if (!loggedIn && !isPublic) {
      return {
        path: '/login',
        query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
      }
    }

    if (loggedIn && to.path === '/login') {
      const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/'
      return redirect
    }

    return true
  })
}

import { createRouter, createWebHistory } from 'vue-router'

/**
 * 前端路由表（基线）：布局壳由后续 Issue（AIL-6）叠加，此处仅占位首页。
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: '首页',
      },
    },
  ],
})

router.afterEach((to) => {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'Admin Template'
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : undefined
  document.title = pageTitle ? `${pageTitle} · ${appTitle}` : appTitle
})

export default router

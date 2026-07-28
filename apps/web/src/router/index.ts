import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

/**
 * 前端路由表：AdminLayout 包裹业务页，提供侧栏 / 顶栏 / 面包屑壳。
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: {
            title: '首页',
          },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
          meta: {
            title: '关于',
          },
        },
      ],
    },
  ],
})

router.afterEach((to) => {
  const appStore = useAppStore()
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : undefined
  document.title = pageTitle
    ? `${pageTitle} · ${appStore.documentTitlePrefix}`
    : appStore.documentTitlePrefix
})

export default router

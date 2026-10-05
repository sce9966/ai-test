import type { RouteRecordRaw } from 'vue-router'
import {
  ClipboardListIcon,
  CreditCardIcon,
  CrownIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ScrollTextIcon,
  Share2Icon,
  UsersIcon,
} from '@lucide/vue'

/**
 * 应用路由表（登录页 + 基础布局下的业务模块）。
 * 侧边栏菜单由该层级结构映射生成。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: '登录',
      layout: false,
      hideInMenu: true,
      public: true,
    },
  },
  {
    path: '/',
    component: () => import('../layouts/basic/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: {
      hideInMenu: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: {
          title: '仪表盘',
          icon: LayoutDashboardIcon,
          affix: true,
        },
      },
      {
        path: 'member',
        name: 'member',
        component: () => import('../views/member/MemberView.vue'),
        meta: {
          title: '会员管理',
          icon: CrownIcon,
        },
      },
      {
        path: 'product',
        name: 'product',
        component: () => import('../views/product/ProductView.vue'),
        meta: {
          title: '商品管理',
          icon: PackageIcon,
        },
      },
      {
        path: 'gift-code',
        name: 'gift-code',
        component: () => import('../views/gift-code/GiftCodeView.vue'),
        meta: {
          title: '兑换码管理',
          icon: KeyRoundIcon,
        },
      },
      {
        path: 'order',
        name: 'order',
        component: () => import('../views/order/OrderListView.vue'),
        meta: {
          title: '订单管理',
          icon: ClipboardListIcon,
        },
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('../views/user/UserView.vue'),
        meta: {
          title: '用户管理',
          icon: UsersIcon,
        },
      },
      {
        path: 'card-key',
        name: 'card-key',
        redirect: '/gift-code',
        meta: {
          hideInMenu: true,
        },
      },
      {
        path: 'payment',
        name: 'payment',
        component: () => import('../views/payment/PaymentView.vue'),
        meta: {
          title: '支付设置',
          icon: CreditCardIcon,
        },
      },
      {
        path: 'operation-log',
        name: 'operation-log',
        component: () => import('../views/operation-log/OperationLogView.vue'),
        meta: {
          title: '操作日志',
          icon: ScrollTextIcon,
        },
      },
      {
        path: 'channel-promo',
        name: 'channel-promo',
        component: () => import('../views/channel-promo/ChannelPromoView.vue'),
        meta: {
          title: '渠道推广码',
          icon: Share2Icon,
        },
      },
    ],
  },
]

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      // 控制台整体布局路由：左侧菜单 + 头部固定，右侧通过子路由切换
      path: '/',
      component: () => import('@/views/ConsoleLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: '/page-compilations',
          name: 'PageCompilations',
          component: () => import('@/views/page-compilations/PageCompilations.vue'),
        },
      ],
    },
  ],
})

export default router

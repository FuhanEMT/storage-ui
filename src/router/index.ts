import { createRouter, createWebHistory } from 'vue-router'
import { msg } from '@/plugins/message'

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
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        // 个人资料
        {
          path: 'personal',
          children: [
            {
              path: '',
              redirect: '/personal/page-compilations',
            },
            {
              path: 'page-compilations',
              name: 'PageCompilations',
              component: () => import('@/views/personal/page-compilations/PageCompilations.vue'),
            },
            {
              path: 'profile',
              name: 'profile',
              component: () => import('@/views/Profile.vue'),
            },
          ],
        },
        // 在线模块
        {
          path: 'online',
          children: [
            {
              path: 'online-websites',
              name: 'OnlineWebsites',
              component: () => import('@/views/online/online-websites/OnlineWebsites.vue'),
            },
          ],
        },
        // 模型 / 模块设置
        {
          path: 'model',
          children: [
            {
              path: 'setting',
              name: 'ModelSetting',
              component: () => import('@/views/model/setting/ModelSetting.vue'),
            },
          ],
        },
      ],
    },
  ],
})

function getTokenFromUserInfo(): string | null {
  const raw = JSON.parse(localStorage.getItem('user-info') || '{}')
  if (!raw) return null
  const info = raw as { token?: string }
  return info?.token ?? null
}

router.beforeEach((to, _from, next) => {
  const isLoginPage = to.name === 'Login'

  if (isLoginPage) {
    next()
    return
  }

  const token = getTokenFromUserInfo()
  if (!token) {
    msg.error('请先登陆')
    next({ name: 'Login' })
    return
  }

  next()
})

export default router

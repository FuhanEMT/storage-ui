import axios, { AxiosError, type AxiosResponse } from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const instance = axios.create({
  // 开发环境通过 Vite 代理，将 /api 转发到 http://localhost:4000
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器：统一加 token、公共 headers
instance.interceptors.request.use(
  (config: any) => {
    const token =
      JSON.parse(localStorage.getItem('user-info') || '{}').token || JSON.parse(sessionStorage.getItem('user-info') || '{}').token
    config.headers = {
      ...(config.headers || {}),
      Authorization: `yuhi ${token}`,
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// 响应拦截器：统一把返回值收敛成「成功返回 data，失败直接抛错」
instance.interceptors.response.use(
  (response: AxiosResponse | any) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user-info')
      sessionStorage.removeItem('user-info')
      useUserStore().clearUserInfo()
      useRouter().push('/login')
    }
    return Promise.reject(error)
  },
)

export default instance


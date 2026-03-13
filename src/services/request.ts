import axios, { AxiosError, type AxiosResponse } from 'axios'

const instance = axios.create({
  // 开发环境通过 Vite 代理，将 /api 转发到 http://localhost:4000
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

// 请求拦截器：统一加 token、公共 headers
instance.interceptors.request.use(
  (config: any) => {
    const token =
      window.localStorage.getItem('token') || window.sessionStorage.getItem('token')

    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      }
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
    // 这里直接返回后端的 data 字段
    if(response.code == 200) return 
    return response.data.data
  },
  (error: AxiosError) => {
    // 任何非 2xx 状态 / 网络异常，统一抛出，让上层中断流程
    return Promise.reject(error)
  },
)

export default instance


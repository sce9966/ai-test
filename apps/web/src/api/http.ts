import axios from 'axios'
import { getAccessToken } from '@/utils/auth'

/**
 * 统一 axios 实例（占位）：后续业务 API 模块应复用此客户端，勿在页面内散落 axios 调用。
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getAccessToken() || import.meta.env.VITE_API_TOKEN
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 错误归一占位：后续可接入统一 toast / 错误码映射
    return Promise.reject(error)
  },
)

import axios, { isAxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { clearAccessToken, getAccessToken } from '@/utils/auth'
import type { ApiResult } from './types'

/**
 * 统一 axios 实例。
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
    if (isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken()
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  },
)

/**
 * 解包后端统一响应。
 *
 * @param promise axios 请求
 */
export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResult<T>>>): Promise<T> {
  const { data } = await promise
  if (!data.success) {
    throw new Error(data.message || '请求失败')
  }
  return data.data as T
}

/**
 * 从接口错误中提取可读提示。
 *
 * @param error 捕获到的错误
 */
export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ApiResult | undefined
    if (payload?.message) {
      return payload.message
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return '请求失败'
}

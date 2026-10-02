import { http } from './http'
import type { ApiResult } from './types'

/**
 * 登录用户公开信息。
 */
export interface AuthUser {
  id: number
  username: string
  avatar?: string
  phone?: string
  email?: string
}

/**
 * 手机号登录请求体。
 */
export interface LoginByPhonePayload {
  phone: string
  password: string
}

/**
 * 手机号登录成功数据。
 */
export interface LoginByPhoneData {
  user: AuthUser
  accessToken: string
}

/**
 * 手机号 + 密码登录。
 *
 * @param payload 手机号与密码
 */
export function loginByPhone(payload: LoginByPhonePayload) {
  return http.post<ApiResult<LoginByPhoneData>>('/auth/loginByPhone', payload)
}

/**
 * 获取当前登录用户信息。
 */
export function fetchUserInfo() {
  return http.get<ApiResult<AuthUser>>('/auth/getUserInfo')
}

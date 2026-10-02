/**
 * 后端统一响应结构。
 */
export interface ApiResult<T = unknown> {
  code: number
  success: boolean
  data?: T
  message?: string
}

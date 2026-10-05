/**
 * 后端统一响应结构。
 */
export interface ApiResult<T = unknown> {
  code: number
  success: boolean
  data?: T
  message?: string
}

/**
 * 分页列表结构。
 */
export interface PaginatedResult<T> {
  rows: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 带审计人姓名的通用字段。
 */
export interface AuditorFields {
  createdBy?: number | null
  updatedBy?: number | null
  createdByName?: string | null
  updatedByName?: string | null
  createdAt: string
  updatedAt: string
}

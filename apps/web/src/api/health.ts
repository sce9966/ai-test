import { http } from './http'

/**
 * 健康检查占位响应（与后端契约对齐前仅作类型示意）。
 */
export interface HealthCheckResult {
  status: string
}

/**
 * 调用后端健康检查占位接口（基线接线，不保证后端已就绪）。
 */
export function fetchHealth() {
  return http.get<HealthCheckResult>('/health')
}

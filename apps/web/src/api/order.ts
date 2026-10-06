import { http, unwrap } from './http'
import type { AuditorFields, PaginatedResult } from './types'

/** 支付状态。 */
export const PayStatus = {
  Unpaid: 0,
  Success: 1,
  Failed: 2,
} as const

/** 订单状态。 */
export const OrderStatus = {
  Normal: 0,
  Finished: 1,
} as const

/**
 * 订单。
 */
export interface Order extends AuditorFields {
  id: number
  orderNo: string
  payStatus: number
  orderStatus: number
  userId: number
  userName: string
  goodsId: string
  goodsName: string
  amount: string
  amountFen?: number
  quantity?: number
  env?: number
  platform?: string | null
  payChannel?: string
  wxOrderId?: string | null
  deliverStatus?: number
  deliveredCode?: string | null
  refundOrderNo?: string | null
}

/**
 * 订单查询参数。
 */
export interface QueryOrderParams {
  page?: number
  pageSize?: number
  orderNo?: string
  goodsName?: string
  userName?: string
  payStatus?: number
  orderStatus?: number
}

/**
 * 查询订单列表。
 *
 * @param params 筛选条件
 */
export function fetchOrderList(params: QueryOrderParams) {
  return unwrap<PaginatedResult<Order>>(http.get('/order', { params }))
}

/**
 * 查询订单详情。
 *
 * @param id 主键
 */
export function fetchOrder(id: number) {
  return unwrap<Order>(http.get(`/order/${id}`))
}

/**
 * 启动虚拟支付退款。
 *
 * @param id 订单主键
 * @param payload 退款参数
 */
export function refundOrder(
  id: number,
  payload: { refundReason: string; reqFrom: string; refundFeeFen?: number },
) {
  return unwrap<Order>(http.post(`/xpay/orders/${id}/refund`, payload, { timeout: 60000 }))
}

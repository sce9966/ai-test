import { http, unwrap } from './http'
import type { AuditorFields, PaginatedResult } from './types'

/** 虚拟商品类型。 */
export type VirtualGoodsKind = 'member' | 'course'

/** 上下架状态。 */
export const GoodsShelfStatus = {
  Off: 0,
  On: 1,
} as const

/**
 * 虚拟商品。
 */
export interface VirtualGoods extends AuditorFields {
  id: number
  goodsId: string
  kind: VirtualGoodsKind
  name: string
  price: string
  linePrice: string
  remark: string
  coverUrls: string[]
  durationDays: number
  status: number
  subtitle?: string | null
  sort?: number | null
  groupName?: string | null
  xpaySyncStatus?: number
  xpaySyncMessage?: string | null
}

/**
 * 创建 / 更新虚拟商品载荷。
 */
export interface VirtualGoodsPayload {
  kind?: VirtualGoodsKind
  name: string
  price: number
  linePrice: number
  remark: string
  coverUrls: string[]
  durationDays: number
  status?: number
  subtitle?: string
  sort?: number
  groupName?: string
}

/**
 * 虚拟商品查询参数。
 */
export interface QueryVirtualGoodsParams {
  page?: number
  pageSize?: number
  kind?: VirtualGoodsKind
  name?: string
  goodsId?: string
  status?: number
}

/**
 * 查询虚拟商品列表。
 *
 * @param params 筛选条件
 */
export function fetchVirtualGoodsList(params: QueryVirtualGoodsParams) {
  return unwrap<PaginatedResult<VirtualGoods>>(http.get('/virtual-goods', { params }))
}

/**
 * 查询虚拟商品详情。
 *
 * @param id 主键
 */
export function fetchVirtualGoods(id: number) {
  return unwrap<VirtualGoods>(http.get(`/virtual-goods/${id}`))
}

/**
 * 新增虚拟商品。
 *
 * @param payload 创建参数
 */
export function createVirtualGoods(payload: VirtualGoodsPayload) {
  return unwrap<VirtualGoods>(http.post('/virtual-goods', payload, { timeout: 120000 }))
}

/**
 * 更新虚拟商品。
 *
 * @param id 主键
 * @param payload 更新参数
 */
export function updateVirtualGoods(id: number, payload: Omit<VirtualGoodsPayload, 'kind'>) {
  return unwrap<VirtualGoods>(http.put(`/virtual-goods/${id}`, payload, { timeout: 120000 }))
}

/**
 * 删除虚拟商品。
 *
 * @param id 主键
 */
export function deleteVirtualGoods(id: number) {
  return unwrap<void>(http.delete(`/virtual-goods/${id}`))
}

import { http, unwrap } from './http'
import type { AuditorFields, PaginatedResult } from './types'
import type { VirtualGoodsKind } from './virtual-goods'

/** 兑换码状态。 */
export const GiftCodeStatus = {
  Unused: 0,
  Bound: 1,
  Voided: 2,
} as const

/**
 * 兑换码。
 */
export interface GiftCode extends AuditorFields {
  id: number
  code: string
  goodsId: string
  status: number
  orderNo?: string | null
  goodsName?: string | null
  goodsKind?: VirtualGoodsKind | null
}

/**
 * 兑换码查询参数。
 */
export interface QueryGiftCodeParams {
  page?: number
  pageSize?: number
  code?: string
  goodsId?: string
  goodsName?: string
  orderNo?: string
  status?: number
}

/**
 * 导入结果。
 */
export interface GiftCodeImportResult {
  successCount: number
  failed: Array<{ code: string; reason: string }>
}

/**
 * 查询兑换码列表。
 *
 * @param params 筛选条件
 */
export function fetchGiftCodeList(params: QueryGiftCodeParams) {
  return unwrap<PaginatedResult<GiftCode>>(http.get('/gift-code', { params }))
}

/**
 * 查询兑换码详情。
 *
 * @param id 主键
 */
export function fetchGiftCode(id: number) {
  return unwrap<GiftCode>(http.get(`/gift-code/${id}`))
}

/**
 * 批量导入兑换码。
 *
 * @param goodsId 商品业务 ID
 * @param codes 兑换码列表
 */
export function importGiftCodes(goodsId: string, codes: string[]) {
  return unwrap<GiftCodeImportResult>(http.post('/gift-code/import', { goodsId, codes }))
}

/**
 * 作废兑换码。
 *
 * @param id 主键
 */
export function voidGiftCode(id: number) {
  return unwrap<GiftCode>(http.patch(`/gift-code/${id}/void`))
}

/**
 * 格式化日期时间为本地字符串。
 *
 * @param value ISO / datetime 字符串
 */
export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 上下架文案。
 *
 * @param status 状态值
 */
export function shelfStatusLabel(status: number): string {
  return status === 1 ? '上架' : '下架'
}

/**
 * 虚拟商品类型文案。
 *
 * @param kind 类型
 */
export function virtualGoodsKindLabel(kind?: string | null): string {
  if (kind === 'member') {
    return '会员'
  }
  if (kind === 'course') {
    return '课程'
  }
  return '-'
}

/**
 * 兑换码状态文案。
 *
 * @param status 状态值
 */
export function giftCodeStatusLabel(status: number): string {
  if (status === 1) {
    return '已绑定'
  }
  if (status === 2) {
    return '已作废'
  }
  return '未使用'
}

/**
 * 支付状态文案。
 *
 * @param status 状态值
 */
export function payStatusLabel(status: number): string {
  if (status === 1) {
    return '支付成功'
  }
  if (status === 2) {
    return '支付失败'
  }
  if (status === 3) {
    return '已退款'
  }
  return '未支付'
}

/**
 * 虚拟支付道具同步状态。
 *
 * @param status 状态值
 */
export function xpaySyncStatusLabel(status?: number | null): string {
  if (status === 1) {
    return '已上传'
  }
  if (status === 2) {
    return '已发布'
  }
  if (status === 3) {
    return '同步失败'
  }
  return '未同步'
}

/**
 * 订单状态文案。
 *
 * @param status 状态值
 */
export function orderStatusLabel(status: number): string {
  return status === 1 ? '完结' : '正常'
}

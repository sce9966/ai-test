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
  return '未支付'
}

/**
 * 订单状态文案。
 *
 * @param status 状态值
 */
export function orderStatusLabel(status: number): string {
  return status === 1 ? '完结' : '正常'
}

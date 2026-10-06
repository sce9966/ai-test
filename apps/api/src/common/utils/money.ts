/**
 * 将元（两位小数）转为分。
 *
 * @param yuan 金额（元）
 */
export function yuanToFen(yuan: string | number): number {
  return Math.round(Number(yuan) * 100);
}

/**
 * 将分转为元字符串（两位小数）。
 *
 * @param fen 金额（分）
 */
export function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}

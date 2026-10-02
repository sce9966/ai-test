/**
 * 生成 6 位数字验证码。
 *
 * @returns 100000–999999 之间的随机整数
 */
export function createRandomCode(): number {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

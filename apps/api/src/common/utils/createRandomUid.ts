import { randomUUID } from 'crypto';

/**
 * 生成短随机 UID（用于文件名、验证码 key 等）。
 *
 * @param length 截取长度，默认 10
 * @returns 去除连字符后的 UUID 片段
 */
export function createRandomUid(length = 10): string {
  const compact = randomUUID().replace(/-/g, '');
  if (length <= compact.length) {
    return compact.slice(0, length);
  }
  return (compact + randomUUID().replace(/-/g, '')).slice(0, length);
}

/**
 * 生成指定长度的业务 UID。
 *
 * @param length 目标长度，默认 20
 */
export function createUniqueUid(length = 20): string {
  return createRandomUid(length);
}

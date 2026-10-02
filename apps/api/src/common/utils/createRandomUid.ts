import { randomUUID } from 'crypto';

/**
 * 生成短随机 UID（用于文件名、验证码 key 等）。
 *
 * @returns 去除连字符后的前 10 位 UUID 片段
 */
export function createRandomUid(): string {
  return randomUUID().replace(/-/g, '').slice(0, 10);
}

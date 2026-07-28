import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className，兼容条件类与 Tailwind 冲突覆盖。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

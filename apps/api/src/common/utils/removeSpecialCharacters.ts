/**
 * 移除字符串中的特殊字符，仅保留字母、数字、空白与连字符。
 *
 * @param inputString 原始字符串
 * @returns 清洗后的字符串
 */
export function removeSpecialCharacters(inputString: string): string {
  return inputString.replace(/[^\w\s-]/g, '');
}

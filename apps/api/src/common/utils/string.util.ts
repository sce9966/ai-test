/**
 * 字符串工具类。
 */
export class StringUtil {
  /**
   * 判断字符串是否为空。
   *
   * @param str 字符串
   * @param trim 是否先去除首尾空格
   */
  static isEmpty(str: string | null | undefined, trim = false): boolean {
    if (str === null || str === undefined) {
      return true;
    }
    if (trim) {
      return str.trim().length === 0;
    }
    return str.length === 0;
  }

  /**
   * 判断字符串是否不为空。
   *
   * @param str 字符串
   * @param trim 是否先去除首尾空格
   */
  static isNotEmpty(str: string | null | undefined, trim = false): boolean {
    return !this.isEmpty(str, trim);
  }

  /**
   * 首字母大写。
   *
   * @param str 字符串
   */
  static capitalize(str: string): string {
    if (this.isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * 首字母小写。
   *
   * @param str 字符串
   */
  static uncapitalize(str: string): string {
    if (this.isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}

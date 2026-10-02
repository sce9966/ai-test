/**
 * 统一 API 响应结构。
 */
export class Result<T = unknown> {
  code: number;
  data?: T;
  success: boolean;
  message?: string;

  /**
   * @param code HTTP / 业务状态码
   * @param success 是否成功
   * @param data 业务数据
   * @param message 提示文案
   */
  constructor(code: number, success: boolean, data?: T, message?: string) {
    this.code = code;
    this.data = data;
    this.success = success;
    this.message = message;
  }

  /**
   * 构造成功响应。
   *
   * @param data 业务数据
   * @param message 提示文案
   */
  static success<T>(data?: T, message = '请求成功'): Result<T> {
    return new Result<T>(200, true, data, message);
  }

  /**
   * 构造失败响应。
   *
   * @param code 错误码
   * @param message 错误文案
   * @param data 可选附加数据
   */
  static fail<T>(code: number, message = '请求失败', data?: T): Result<T> {
    return new Result<T>(code, false, data, message);
  }
}

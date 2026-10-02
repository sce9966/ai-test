import { Injectable } from '@nestjs/common';

/**
 * 根应用服务（工程基线占位）。
 */
@Injectable()
export class AppService {
  /**
   * 构造基线探活响应。
   *
   * @returns 探活消息对象
   */
  getHello(): { message: string } {
    return { message: 'openkey api is running' };
  }
}

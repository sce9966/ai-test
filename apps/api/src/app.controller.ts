import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 根路由控制器（工程基线占位，不含业务 API）。
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 返回基线探活文案，用于确认 Nest 进程已启动。
   *
   * @returns 探活消息
   */
  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}

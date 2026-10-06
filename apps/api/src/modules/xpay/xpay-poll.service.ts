import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { XpayPayService } from './xpay-pay.service';

const POLL_MS = 30_000;

/**
 * 发货轮询：补偿客户端回调丢失与推送延迟。
 */
@Injectable()
export class XpayPollService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(XpayPollService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;

  constructor(private readonly xpayPayService: XpayPayService) {}

  /**
   * 启动定时轮询。
   */
  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick();
    }, POLL_MS);
  }

  /**
   * 停止定时器。
   */
  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * 单次轮询，避免重叠。
   */
  private async tick(): Promise<void> {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      await this.xpayPayService.pollPendingOrders();
    } catch (error) {
      this.logger.warn(`虚拟支付轮询失败: ${error instanceof Error ? error.message : error}`);
    } finally {
      this.running = false;
    }
  }
}

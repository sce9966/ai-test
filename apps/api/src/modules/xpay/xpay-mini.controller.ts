import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ConfirmXpayOrderDto, CreateXpayOrderDto } from './dto/xpay.dto';
import { XpayPayService } from './xpay-pay.service';

/**
 * 小程序侧道具直购接口。
 */
@ApiTags('虚拟支付-小程序')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('wechat-mini/xpay')
export class XpayMiniController {
  constructor(private readonly xpayPayService: XpayPayService) {}

  /**
   * 落本地单并返回 requestVirtualPayment 参数。
   */
  @Post('create-order')
  @ApiOperation({ summary: '创建道具直购单并签名' })
  createOrder(@Body() dto: CreateXpayOrderDto, @Req() req: Request) {
    return this.xpayPayService.createPayParams(
      req.user!.id,
      dto.goodsId,
      dto.platform,
      dto.buyQuantity ?? 1,
      dto.attach ?? '',
    );
  }

  /**
   * 客户端 success 后同步微信订单并发货（回调可能丢失）。
   */
  @Post('confirm')
  @ApiOperation({ summary: '确认支付并同步发货' })
  confirm(@Body() dto: ConfirmXpayOrderDto, @Req() req: Request) {
    return this.xpayPayService.confirmByClient(req.user!.id, dto.orderNo);
  }

  /**
   * 查询自己的订单。
   */
  @Get('orders/:orderNo')
  @ApiOperation({ summary: '查询自己的虚拟支付订单' })
  findMine(@Param('orderNo') orderNo: string, @Req() req: Request) {
    return this.xpayPayService.findMine(req.user!.id, orderNo);
  }
}

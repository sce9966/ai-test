import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { QueryOrderDto } from './dto/order.dto';
import { OrderService } from './order.service';

/**
 * 订单控制器（后台只读）。
 */
@ApiTags('订单')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 分页查询订单。
   */
  @Get()
  @ApiOperation({ summary: '查询订单列表' })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  /**
   * 按付款单号查询订单。
   */
  @Get('by-order-no/:orderNo')
  @ApiOperation({ summary: '按付款单号查询订单' })
  findByOrderNo(@Param('orderNo') orderNo: string) {
    return this.orderService.findByOrderNo(orderNo);
  }

  /**
   * 按主键查询订单。
   */
  @Get(':id')
  @ApiOperation({ summary: '查询订单详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }
}

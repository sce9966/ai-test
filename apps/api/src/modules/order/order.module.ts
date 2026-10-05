import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

/**
 * 订单模块。
 */
@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

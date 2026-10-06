import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { XpayModule } from '../xpay/xpay.module';
import { VirtualGoodsController } from './virtual-goods.controller';
import { VirtualGoodsService } from './virtual-goods.service';

/**
 * 虚拟商品模块。
 */
@Module({
  imports: [TypeOrmModule.forFeature([VirtualGoods, GiftCode, Order, User]), XpayModule],
  controllers: [VirtualGoodsController],
  providers: [VirtualGoodsService],
  exports: [VirtualGoodsService],
})
export class VirtualGoodsModule {}

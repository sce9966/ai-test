import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { WechatMiniModule } from '../wechat-mini/wechat-mini.module';
import { XpayCallbackController } from './xpay-callback.controller';
import { XpayClientService } from './xpay-client.service';
import { XpayGoodsService } from './xpay-goods.service';
import { XpayMiniController } from './xpay-mini.controller';
import { XpayPayService } from './xpay-pay.service';
import { XpayPollService } from './xpay-poll.service';

/**
 * 微信虚拟支付（道具直购）模块。
 */
@Module({
  imports: [
    WechatMiniModule,
    TypeOrmModule.forFeature([Order, GiftCode, VirtualGoods, User]),
  ],
  controllers: [XpayCallbackController, XpayMiniController],
  providers: [XpayClientService, XpayGoodsService, XpayPayService, XpayPollService],
  exports: [XpayGoodsService, XpayPayService, XpayClientService],
})
export class XpayModule {}

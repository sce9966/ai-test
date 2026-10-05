import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { GiftCodeController } from './gift-code.controller';
import { GiftCodeService } from './gift-code.service';

/**
 * 兑换码模块。
 */
@Module({
  imports: [TypeOrmModule.forFeature([GiftCode, VirtualGoods, User])],
  controllers: [GiftCodeController],
  providers: [GiftCodeService],
  exports: [GiftCodeService],
})
export class GiftCodeModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user/user.entity';
import { WechatAccessTokenService } from './wechat-access-token.service';
import { WechatMiniController } from './wechat-mini.controller';
import { WechatMiniService } from './wechat-mini.service';

/**
 * 微信小程序调用模块。
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [WechatMiniController],
  providers: [WechatMiniService, WechatAccessTokenService],
  exports: [WechatMiniService, WechatAccessTokenService],
})
export class WechatMiniModule {}

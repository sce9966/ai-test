import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { WechatMiniLoginDto } from './dto/wechat-mini.dto';
import { WechatMiniService } from './wechat-mini.service';

/**
 * 微信小程序服务端接口（登录凭证校验 / 检验登录态 / 重置登录态）。
 *
 * @see https://developers.weixin.qq.com/miniprogram/dev/server/API/user-login/
 */
@ApiTags('微信小程序')
@Controller('wechat-mini')
export class WechatMiniController {
  constructor(private readonly wechatMiniService: WechatMiniService) {}

  /**
   * 小程序登录：客户端 wx.login 拿到 code 后调用本接口。
   */
  @Post('login')
  @ApiOperation({ summary: '小程序登录（jscode2session）' })
  login(@Body() dto: WechatMiniLoginDto, @Req() req: Request) {
    return this.wechatMiniService.login(dto, req);
  }

  /**
   * 检验服务端保存的 session_key 是否有效。
   */
  @Post('check-session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检验小程序登录态' })
  checkSession(@Req() req: Request) {
    return this.wechatMiniService.checkSession(req.user!.id);
  }

  /**
   * 重置服务端保存的 session_key。
   */
  @Post('reset-session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '重置小程序登录态' })
  resetSession(@Req() req: Request) {
    return this.wechatMiniService.resetSession(req.user!.id);
  }
}

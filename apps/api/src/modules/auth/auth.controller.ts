import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthService } from './auth.service';
import { LoginByPhoneDto, SendPhoneCodeDto, UserRegisterByPhoneDto } from './dto/auth.dto';

/**
 * 鉴权控制器。
 */
@ApiTags('权限管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户通过手机号注册。
   */
  @Post('registerByPhone')
  @ApiOperation({ summary: '用户通过手机号注册' })
  async registerByPhone(@Body() body: UserRegisterByPhoneDto, @Req() req: Request) {
    return this.authService.registerByPhone(body, req);
  }

  /**
   * 用户手机号登录。
   */
  @Post('loginByPhone')
  @ApiOperation({ summary: '用户手机号登录' })
  async loginByPhone(@Body() body: LoginByPhoneDto) {
    return this.authService.loginByPhone(body);
  }

  /**
   * 发送手机验证码。
   */
  @Post('sendPhoneCode')
  @ApiOperation({ summary: '发送手机验证码' })
  async sendPhoneCode(@Body() body: SendPhoneCodeDto) {
    return this.authService.sendPhoneCode(body);
  }

  /**
   * 获取当前登录用户信息。
   */
  @Get('getUserInfo')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  async getUserInfo(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      return this.authService.getAuthUserInfo(0);
    }
    return this.authService.getAuthUserInfo(userId);
  }
}

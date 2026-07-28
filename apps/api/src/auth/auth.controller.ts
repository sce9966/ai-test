import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayloadUser } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUserResponseDto, LoginResponseDto } from './dto/auth-response.dto';

/**
 * 鉴权控制器：登录 / 当前用户 / 登出。
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户名密码登录，返回 Access Token。
   *
   * @param dto 登录入参
   * @returns Token 与用户摘要
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * 获取当前登录用户（需 Bearer Token）。
   *
   * @param user 鉴权上下文用户
   * @returns 脱敏用户信息
   */
  @Get('me')
  me(@CurrentUser() user: JwtPayloadUser): Promise<CurrentUserResponseDto> {
    return this.authService.getCurrentUser(user);
  }

  /**
   * 登出：将当前 Token 加入 Redis 黑名单。
   *
   * @param user 鉴权上下文用户
   * @returns 成功标记
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtPayloadUser): Promise<{ success: true }> {
    await this.authService.logout(user, user.exp);
    return { success: true };
  }
}

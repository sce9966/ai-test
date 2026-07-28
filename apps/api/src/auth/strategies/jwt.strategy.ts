import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '../../users/entities/user.entity';
import type { JwtPayload, JwtPayloadUser } from '../interfaces/jwt-payload.interface';
import { TokenBlacklistService } from '../token-blacklist.service';

/**
 * Passport JWT 策略：校验签名、黑名单与用户状态，并注入租户上下文。
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  /**
   * 校验通过后将载荷映射为请求用户；含 Redis 黑名单与租户内用户存在性检查。
   *
   * @param payload JWT 载荷
   * @returns 注入 `request.user` 的用户视图
   * @throws UnauthorizedException Token 已吊销或用户不可用
   */
  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    if (!payload?.sub || !payload?.tenantId || !payload?.jti) {
      throw new UnauthorizedException('无效的访问令牌');
    }

    const blacklisted = await this.tokenBlacklistService.isBlacklisted(payload.jti);
    if (blacklisted) {
      throw new UnauthorizedException('访问令牌已失效');
    }

    const user = await this.usersService.findByIdInTenant(payload.tenantId, payload.sub);
    if (user.status !== UserStatus.Active) {
      throw new UnauthorizedException('账号已禁用');
    }

    return {
      userId: user.id,
      tenantId: user.tenantId,
      username: user.username,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}

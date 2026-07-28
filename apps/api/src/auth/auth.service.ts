import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { UserEntity, UserStatus } from '../users/entities/user.entity';
import { RbacService } from '../rbac/rbac.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUserResponseDto, LoginResponseDto } from './dto/auth-response.dto';
import type { JwtPayload, JwtPayloadUser } from './interfaces/jwt-payload.interface';
import { TokenBlacklistService } from './token-blacklist.service';

/** bcrypt 成本因子（≥ 12） */
const BCRYPT_COST = 12;

/**
 * 鉴权业务服务：登录签发 JWT、查询当前用户、登出写入 Redis 黑名单。
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * 开发环境可选写入演示账号，便于联调（幂等）。
   */
  async onModuleInit(): Promise<void> {
    const seedEnabled = this.configService.get<boolean>('auth.seedDemoUser', false);
    if (!seedEnabled) {
      return;
    }

    const tenantId = this.configService.get<string>('auth.defaultTenantId', 'default');
    const username = this.configService.get<string>('auth.demoUsername', 'admin');
    const password = this.configService.get<string>('auth.demoPassword', 'Admin@123456');
    const existing = await this.usersService.findByUsername(tenantId, username);
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    await this.usersService.create({
      tenantId,
      username,
      displayName: '演示管理员',
      passwordHash,
      status: UserStatus.Active,
    });
    this.logger.log(
      `已写入演示账号 tenantId=${tenantId} username=${username}（密码见 AUTH_DEMO_PASSWORD / .env.example）`,
    );
  }

  /**
   * 校验凭据并签发 Access Token。
   *
   * @param dto 登录入参
   * @returns Token 与用户摘要
   * @throws UnauthorizedException 用户名或密码错误 / 账号禁用
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const tenantId =
      dto.tenantId?.trim() || this.configService.get<string>('auth.defaultTenantId', 'default');
    const user = await this.usersService.findByUsername(tenantId, dto.username.trim());
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status !== UserStatus.Active) {
      throw new UnauthorizedException('账号已禁用');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const jti = randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      username: user.username,
      jti,
    };

    const expiresInConfig = this.configService.get<string>('jwt.expiresIn', '2h');
    const expiresInSeconds = this.parseExpiresInToSeconds(expiresInConfig);
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresInConfig as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
      user: await this.toCurrentUser(user),
    };
  }

  /**
   * 返回当前鉴权用户详情（租户内查询）。
   *
   * @param current 鉴权上下文中的用户
   * @returns 脱敏用户信息
   */
  async getCurrentUser(current: JwtPayloadUser): Promise<CurrentUserResponseDto> {
    const user = await this.usersService.findByIdInTenant(current.tenantId, current.userId);
    return this.toCurrentUser(user);
  }

  /**
   * 登出：将当前 Token 的 jti 写入 Redis 黑名单直至自然过期。
   *
   * @param current 鉴权用户
   * @param expUnix JWT `exp` 声明（秒）；缺失时使用配置默认 TTL
   */
  async logout(current: JwtPayloadUser, expUnix?: number): Promise<void> {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const configuredTtl = this.parseExpiresInToSeconds(
      this.configService.get<string>('jwt.expiresIn', '2h'),
    );
    const ttlSeconds =
      typeof expUnix === 'number' && expUnix > nowSeconds ? expUnix - nowSeconds : configuredTtl;
    await this.tokenBlacklistService.add(current.jti, ttlSeconds);
  }

  /**
   * 将实体映射为对外用户视图（含角色与权限码）。
   *
   * @param user 用户实体
   * @returns 脱敏响应
   */
  private async toCurrentUser(user: UserEntity): Promise<CurrentUserResponseDto> {
    const rbac = await this.rbacService.getUserPermissions(user.tenantId, user.id);
    return {
      id: user.id,
      tenantId: user.tenantId,
      username: user.username,
      displayName: user.displayName,
      roles: rbac.roles,
      permissions: rbac.permissions,
    };
  }

  /**
   * 将 `60s` / `15m` / `2h` / `7d` 或纯数字秒解析为秒数。
   *
   * @param value 过期配置
   * @returns 秒数
   */
  private parseExpiresInToSeconds(value: string): number {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    const match = /^(\d+)([smhd])$/i.exec(trimmed);
    if (!match) {
      return 7200;
    }
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const factor =
      unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : unit === 'd' ? 86400 : 1;
    return amount * factor;
  }
}

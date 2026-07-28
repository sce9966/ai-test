import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { UsersService } from '../users/users.service';
import { UserEntity, UserStatus } from '../users/entities/user.entity';
import { RbacService } from '../rbac/rbac.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<UsersService, 'findByUsername' | 'findByIdInTenant' | 'create'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let tokenBlacklistService: jest.Mocked<Pick<TokenBlacklistService, 'add'>>;

  const user: UserEntity = {
    id: 'user-1',
    tenantId: 'default',
    username: 'admin',
    displayName: '演示管理员',
    passwordHash: '',
    status: UserStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    user.passwordHash = await bcrypt.hash('Admin@123456', 12);

    usersService = {
      findByUsername: jest.fn(),
      findByIdInTenant: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    };
    tokenBlacklistService = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const rbacService = {
      getUserPermissions: jest.fn().mockResolvedValue({
        userId: 'user-1',
        tenantId: 'default',
        roles: ['admin'],
        permissions: ['system:user:list'],
      }),
    };

    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const map: Record<string, unknown> = {
          'auth.seedDemoUser': false,
          'auth.defaultTenantId': 'default',
          'jwt.expiresIn': '2h',
        };
        return key in map ? map[key] : defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: TokenBlacklistService, useValue: tokenBlacklistService },
        { provide: RbacService, useValue: rbacService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('凭据正确时应返回 accessToken', async () => {
      usersService.findByUsername.mockResolvedValue(user);

      const result = await service.login({
        username: 'admin',
        password: 'Admin@123456',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(7200);
      expect(result.user.username).toBe('admin');
      expect(result.user.tenantId).toBe('default');
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('密码错误时应抛出 UnauthorizedException', async () => {
      usersService.findByUsername.mockResolvedValue(user);

      await expect(
        service.login({ username: 'admin', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('应将 jti 写入黑名单', async () => {
      const now = Math.floor(Date.now() / 1000);
      await service.logout(
        { userId: 'user-1', tenantId: 'default', username: 'admin', jti: 'jti-1', exp: now + 100 },
        now + 100,
      );

      expect(tokenBlacklistService.add).toHaveBeenCalledWith('jti-1', expect.any(Number));
    });
  });
});

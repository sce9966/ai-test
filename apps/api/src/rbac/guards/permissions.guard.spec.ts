import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from '../rbac.service';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let rbacService: jest.Mocked<Pick<RbacService, 'userHasAllPermissions'>>;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  /**
   * 构造最小 ExecutionContext mock。
   *
   * @param user 请求用户
   */
  const createContext = (user?: { userId: string; tenantId: string }) =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as never;

  beforeEach(async () => {
    rbacService = {
      userHasAllPermissions: jest.fn(),
    };
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        { provide: RbacService, useValue: rbacService },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get(PermissionsGuard);
  });

  it('未声明权限码时应直接放行', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(rbacService.userHasAllPermissions).not.toHaveBeenCalled();
  });

  it('缺少用户时应抛出 UnauthorizedException', async () => {
    reflector.getAllAndOverride.mockReturnValue(['system:user:list']);
    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('无权限时应抛出 ForbiddenException（403）', async () => {
    reflector.getAllAndOverride.mockReturnValue(['system:user:list']);
    rbacService.userHasAllPermissions.mockResolvedValue(false);

    await expect(
      guard.canActivate(createContext({ userId: 'u1', tenantId: 'default' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      REQUIRED_PERMISSIONS_KEY,
      expect.any(Array),
    );
  });

  it('具备全部权限时应放行', async () => {
    reflector.getAllAndOverride.mockReturnValue(['system:user:list']);
    rbacService.userHasAllPermissions.mockResolvedValue(true);

    await expect(
      guard.canActivate(createContext({ userId: 'u1', tenantId: 'default' })),
    ).resolves.toBe(true);
  });
});

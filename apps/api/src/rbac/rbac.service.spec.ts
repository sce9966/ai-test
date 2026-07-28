import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RoleEntity, RoleStatus } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { MenuEntity } from './entities/menu.entity';
import { RoleMenuEntity } from './entities/role-menu.entity';

describe('RbacService', () => {
  let service: RbacService;

  const userRolesRepository = {
    find: jest.fn(),
  };
  const rolesRepository = {
    find: jest.fn(),
  };
  const rolePermissionsRepository = {
    find: jest.fn(),
  };
  const permissionsRepository = {
    find: jest.fn(),
  };
  const menusRepository = {
    find: jest.fn(),
  };
  const roleMenusRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: getRepositoryToken(RoleEntity), useValue: rolesRepository },
        { provide: getRepositoryToken(PermissionEntity), useValue: permissionsRepository },
        { provide: getRepositoryToken(UserRoleEntity), useValue: userRolesRepository },
        {
          provide: getRepositoryToken(RolePermissionEntity),
          useValue: rolePermissionsRepository,
        },
        { provide: getRepositoryToken(MenuEntity), useValue: menusRepository },
        { provide: getRepositoryToken(RoleMenuEntity), useValue: roleMenusRepository },
      ],
    }).compile();

    service = module.get(RbacService);
  });

  it('用户无角色时应返回空权限码', async () => {
    userRolesRepository.find.mockResolvedValue([]);
    await expect(service.getPermissionCodesForUser('default', 'u1')).resolves.toEqual([]);
  });

  it('应返回角色继承后的权限码并集', async () => {
    userRolesRepository.find.mockResolvedValue([
      { tenantId: 'default', userId: 'u1', roleId: 'r1' },
    ]);
    rolesRepository.find.mockResolvedValue([
      { id: 'r1', tenantId: 'default', code: 'admin', status: RoleStatus.Active },
    ]);
    rolePermissionsRepository.find.mockResolvedValue([
      { tenantId: 'default', roleId: 'r1', permissionId: 'p1' },
      { tenantId: 'default', roleId: 'r1', permissionId: 'p2' },
    ]);
    permissionsRepository.find.mockResolvedValue([
      { id: 'p1', code: 'system:user:list' },
      { id: 'p2', code: 'system:user:create' },
    ]);

    await expect(service.getPermissionCodesForUser('default', 'u1')).resolves.toEqual([
      'system:user:create',
      'system:user:list',
    ]);
  });

  it('userHasAllPermissions 在缺码时应为 false', async () => {
    userRolesRepository.find.mockResolvedValue([
      { tenantId: 'default', userId: 'u1', roleId: 'r1' },
    ]);
    rolesRepository.find.mockResolvedValue([
      { id: 'r1', tenantId: 'default', code: 'admin', status: RoleStatus.Active },
    ]);
    rolePermissionsRepository.find.mockResolvedValue([
      { tenantId: 'default', roleId: 'r1', permissionId: 'p1' },
    ]);
    permissionsRepository.find.mockResolvedValue([{ id: 'p1', code: 'system:user:list' }]);

    await expect(
      service.userHasAllPermissions('default', 'u1', ['system:user:list', 'system:user:delete']),
    ).resolves.toBe(false);
  });
});

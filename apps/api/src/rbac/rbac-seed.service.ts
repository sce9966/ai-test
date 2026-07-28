import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  ALL_PERMISSION_CODES,
  PermissionCodes,
  type PermissionCode,
} from './constants/permission-codes';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity, RoleStatus } from './entities/role.entity';
import { MenuEntity, MenuStatus, MenuType } from './entities/menu.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleMenuEntity } from './entities/role-menu.entity';

/** 权限码中文名称映射 */
const PERMISSION_LABELS: Record<PermissionCode, string> = {
  [PermissionCodes.UserList]: '用户列表',
  [PermissionCodes.UserCreate]: '用户新建',
  [PermissionCodes.UserUpdate]: '用户编辑',
  [PermissionCodes.UserDelete]: '用户删除',
  [PermissionCodes.RoleList]: '角色列表',
  [PermissionCodes.RoleCreate]: '角色新建',
  [PermissionCodes.RoleUpdate]: '角色编辑',
  [PermissionCodes.RoleDelete]: '角色删除',
  [PermissionCodes.MenuList]: '菜单列表',
  [PermissionCodes.MenuCreate]: '菜单新建',
  [PermissionCodes.MenuUpdate]: '菜单编辑',
  [PermissionCodes.MenuDelete]: '菜单删除',
  [PermissionCodes.RbacDemoPing]: 'RBAC 演示接口',
};

/**
 * 开发环境 RBAC 演示种子（幂等）：权限目录、管理员角色、菜单与绑定。
 * 使用 OnApplicationBootstrap，确保 Auth 演示账号已写入后再绑定角色。
 */
@Injectable()
export class RbacSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(MenuEntity)
    private readonly menusRepository: Repository<MenuEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRolesRepository: Repository<UserRoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionsRepository: Repository<RolePermissionEntity>,
    @InjectRepository(RoleMenuEntity)
    private readonly roleMenusRepository: Repository<RoleMenuEntity>,
  ) {}

  /**
   * 应用启动完成后按配置写入演示 RBAC 数据。
   */
  async onApplicationBootstrap(): Promise<void> {
    const seedEnabled = this.configService.get<boolean>('auth.seedDemoUser', false);
    if (!seedEnabled) {
      return;
    }

    const tenantId = this.configService.get<string>('auth.defaultTenantId', 'default');
    const username = this.configService.get<string>('auth.demoUsername', 'admin');

    const permissions = await this.ensurePermissions();
    const adminRole = await this.ensureAdminRole(tenantId);
    await this.bindAllPermissions(tenantId, adminRole.id, permissions);
    const menus = await this.ensureMenus(tenantId);
    await this.bindMenus(tenantId, adminRole.id, menus);

    const user = await this.usersService.findByUsername(tenantId, username);
    if (user) {
      await this.ensureUserRole(tenantId, user.id, adminRole.id);
    } else {
      this.logger.warn(
        `未找到演示用户 tenantId=${tenantId} username=${username}，跳过 user_roles 绑定`,
      );
    }

    this.logger.log(
      `RBAC 演示种子已就绪 tenantId=${tenantId} role=admin permissions=${permissions.length}`,
    );
  }

  /**
   * 确保权限码目录存在。
   *
   * @returns 权限实体列表
   */
  private async ensurePermissions(): Promise<PermissionEntity[]> {
    const result: PermissionEntity[] = [];
    for (const code of ALL_PERMISSION_CODES) {
      let entity = await this.permissionsRepository.findOne({ where: { code } });
      if (!entity) {
        entity = await this.permissionsRepository.save(
          this.permissionsRepository.create({
            code,
            name: PERMISSION_LABELS[code],
            description: PERMISSION_LABELS[code],
          }),
        );
      }
      result.push(entity);
    }
    return result;
  }

  /**
   * 确保租户内管理员角色存在。
   *
   * @param tenantId 租户 ID
   * @returns 角色实体
   */
  private async ensureAdminRole(tenantId: string): Promise<RoleEntity> {
    let role = await this.rolesRepository.findOne({
      where: { tenantId, code: 'admin' },
    });
    if (!role) {
      role = await this.rolesRepository.save(
        this.rolesRepository.create({
          tenantId,
          code: 'admin',
          name: '管理员',
          description: '演示管理员角色（拥有全部内置权限码）',
          status: RoleStatus.Active,
        }),
      );
    }
    return role;
  }

  /**
   * 将全部权限绑定到角色（幂等）。
   *
   * @param tenantId 租户 ID
   * @param roleId 角色 ID
   * @param permissions 权限列表
   */
  private async bindAllPermissions(
    tenantId: string,
    roleId: string,
    permissions: PermissionEntity[],
  ): Promise<void> {
    for (const permission of permissions) {
      const existing = await this.rolePermissionsRepository.findOne({
        where: { tenantId, roleId, permissionId: permission.id },
      });
      if (!existing) {
        await this.rolePermissionsRepository.save(
          this.rolePermissionsRepository.create({
            tenantId,
            roleId,
            permissionId: permission.id,
          }),
        );
      }
    }
  }

  /**
   * 确保演示菜单存在。
   *
   * @param tenantId 租户 ID
   * @returns 菜单列表
   */
  private async ensureMenus(tenantId: string): Promise<MenuEntity[]> {
    const existing = await this.menusRepository.find({ where: { tenantId } });
    if (existing.length > 0) {
      return existing;
    }

    const system = await this.menusRepository.save(
      this.menusRepository.create({
        tenantId,
        parentId: null,
        name: '系统管理',
        path: '/system',
        component: null,
        icon: 'settings',
        permissionCode: null,
        sortOrder: 10,
        type: MenuType.Directory,
        status: MenuStatus.Active,
      }),
    );

    const users = await this.menusRepository.save(
      this.menusRepository.create({
        tenantId,
        parentId: system.id,
        name: '用户管理',
        path: '/system/users',
        component: 'system/users/index',
        icon: 'users',
        permissionCode: PermissionCodes.UserList,
        sortOrder: 1,
        type: MenuType.Menu,
        status: MenuStatus.Active,
      }),
    );

    const roles = await this.menusRepository.save(
      this.menusRepository.create({
        tenantId,
        parentId: system.id,
        name: '角色管理',
        path: '/system/roles',
        component: 'system/roles/index',
        icon: 'shield',
        permissionCode: PermissionCodes.RoleList,
        sortOrder: 2,
        type: MenuType.Menu,
        status: MenuStatus.Active,
      }),
    );

    return [system, users, roles];
  }

  /**
   * 绑定角色与菜单（幂等）。
   *
   * @param tenantId 租户 ID
   * @param roleId 角色 ID
   * @param menus 菜单列表
   */
  private async bindMenus(tenantId: string, roleId: string, menus: MenuEntity[]): Promise<void> {
    for (const menu of menus) {
      const existing = await this.roleMenusRepository.findOne({
        where: { tenantId, roleId, menuId: menu.id },
      });
      if (!existing) {
        await this.roleMenusRepository.save(
          this.roleMenusRepository.create({
            tenantId,
            roleId,
            menuId: menu.id,
          }),
        );
      }
    }
  }

  /**
   * 确保用户绑定管理员角色。
   *
   * @param tenantId 租户 ID
   * @param userId 用户 ID
   * @param roleId 角色 ID
   */
  private async ensureUserRole(tenantId: string, userId: string, roleId: string): Promise<void> {
    const existing = await this.userRolesRepository.findOne({
      where: { tenantId, userId, roleId },
    });
    if (!existing) {
      await this.userRolesRepository.save(
        this.userRolesRepository.create({
          tenantId,
          userId,
          roleId,
        }),
      );
    }
  }
}

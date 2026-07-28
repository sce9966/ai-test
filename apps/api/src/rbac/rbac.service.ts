import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RoleEntity, RoleStatus } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { MenuEntity, MenuStatus } from './entities/menu.entity';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { UserPermissionsResponseDto } from './dto/user-permissions-response.dto';

/**
 * RBAC 查询服务：在租户范围内解析用户角色与权限码。
 */
@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRolesRepository: Repository<UserRoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionsRepository: Repository<RolePermissionEntity>,
    @InjectRepository(MenuEntity)
    private readonly menusRepository: Repository<MenuEntity>,
    @InjectRepository(RoleMenuEntity)
    private readonly roleMenusRepository: Repository<RoleMenuEntity>,
  ) {}

  /**
   * 查询用户在当前租户下启用角色的编码列表。
   *
   * @param tenantId 租户 ID（来自鉴权上下文）
   * @param userId 用户 ID
   * @returns 角色编码
   */
  async getRoleCodesForUser(tenantId: string, userId: string): Promise<string[]> {
    const userRoles = await this.userRolesRepository.find({
      where: { tenantId, userId },
    });
    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((row) => row.roleId);
    const roles = await this.rolesRepository.find({
      where: {
        tenantId,
        id: In(roleIds),
        status: RoleStatus.Active,
      },
    });
    return roles.map((role) => role.code).sort();
  }

  /**
   * 查询用户经角色继承后的权限码并集（租户隔离）。
   *
   * @param tenantId 租户 ID
   * @param userId 用户 ID
   * @returns 权限码列表（去重排序）
   */
  async getPermissionCodesForUser(tenantId: string, userId: string): Promise<string[]> {
    const userRoles = await this.userRolesRepository.find({
      where: { tenantId, userId },
    });
    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((row) => row.roleId);
    const activeRoles = await this.rolesRepository.find({
      where: {
        tenantId,
        id: In(roleIds),
        status: RoleStatus.Active,
      },
    });
    if (activeRoles.length === 0) {
      return [];
    }

    const activeRoleIds = activeRoles.map((role) => role.id);
    const rolePermissions = await this.rolePermissionsRepository.find({
      where: {
        tenantId,
        roleId: In(activeRoleIds),
      },
    });
    if (rolePermissions.length === 0) {
      return [];
    }

    const permissionIds = [...new Set(rolePermissions.map((row) => row.permissionId))];
    const permissions = await this.permissionsRepository.find({
      where: { id: In(permissionIds) },
    });
    return [...new Set(permissions.map((item) => item.code))].sort();
  }

  /**
   * 组装当前用户的角色与权限码视图。
   *
   * @param tenantId 租户 ID
   * @param userId 用户 ID
   * @returns 权限包 DTO
   */
  async getUserPermissions(tenantId: string, userId: string): Promise<UserPermissionsResponseDto> {
    const [roles, permissions] = await Promise.all([
      this.getRoleCodesForUser(tenantId, userId),
      this.getPermissionCodesForUser(tenantId, userId),
    ]);
    return {
      userId,
      tenantId,
      roles,
      permissions,
    };
  }

  /**
   * 判断用户是否具备全部所需权限码。
   *
   * @param tenantId 租户 ID
   * @param userId 用户 ID
   * @param requiredCodes 所需权限码（AND）
   * @returns 是否全部具备
   */
  async userHasAllPermissions(
    tenantId: string,
    userId: string,
    requiredCodes: string[],
  ): Promise<boolean> {
    if (requiredCodes.length === 0) {
      return true;
    }
    const owned = new Set(await this.getPermissionCodesForUser(tenantId, userId));
    return requiredCodes.every((code) => owned.has(code));
  }

  /**
   * 查询用户可访问的菜单列表（扁平；树组装留给 AIL-9）。
   *
   * @param tenantId 租户 ID
   * @param userId 用户 ID
   * @returns 启用状态的菜单实体
   */
  async getMenusForUser(tenantId: string, userId: string): Promise<MenuEntity[]> {
    const userRoles = await this.userRolesRepository.find({
      where: { tenantId, userId },
    });
    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((row) => row.roleId);
    const activeRoles = await this.rolesRepository.find({
      where: {
        tenantId,
        id: In(roleIds),
        status: RoleStatus.Active,
      },
    });
    if (activeRoles.length === 0) {
      return [];
    }

    const roleMenus = await this.roleMenusRepository.find({
      where: {
        tenantId,
        roleId: In(activeRoles.map((role) => role.id)),
      },
    });
    if (roleMenus.length === 0) {
      return [];
    }

    const menuIds = [...new Set(roleMenus.map((row) => row.menuId))];
    return this.menusRepository.find({
      where: {
        tenantId,
        id: In(menuIds),
        status: MenuStatus.Active,
      },
      order: { sortOrder: 'ASC' },
    });
  }
}

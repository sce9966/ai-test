import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { MenuEntity } from './entities/menu.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { RbacSeedService } from './rbac-seed.service';

/**
 * RBAC 模块：权限模型、权限查询与种子；全局 PermissionsGuard 在 AppModule 注册以保证顺序。
 */
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      PermissionEntity,
      RoleEntity,
      MenuEntity,
      UserRoleEntity,
      RolePermissionEntity,
      RoleMenuEntity,
    ]),
  ],
  controllers: [RbacController],
  providers: [RbacService, RbacSeedService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard, TypeOrmModule],
})
export class RbacModule {}

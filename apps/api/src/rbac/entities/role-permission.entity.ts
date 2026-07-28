import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 角色-权限关联（租户隔离）。
 */
@Entity('role_permissions')
@Index('uk_role_permissions_tenant_role_perm', ['tenantId', 'roleId', 'permissionId'], {
  unique: true,
})
@Index('idx_role_permissions_tenant_role', ['tenantId', 'roleId'])
export class RolePermissionEntity {
  /**
   * 主键（UUID）。
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * 租户 ID。
   */
  @Column({ name: 'tenant_id', type: 'varchar', length: 36 })
  tenantId!: string;

  /**
   * 角色 ID。
   */
  @Column({ name: 'role_id', type: 'varchar', length: 36 })
  roleId!: string;

  /**
   * 权限 ID。
   */
  @Column({ name: 'permission_id', type: 'varchar', length: 36 })
  permissionId!: string;

  /**
   * 创建时间。
   */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}

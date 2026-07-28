import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 用户-角色关联（租户隔离）。
 */
@Entity('user_roles')
@Index('uk_user_roles_tenant_user_role', ['tenantId', 'userId', 'roleId'], { unique: true })
@Index('idx_user_roles_tenant_user', ['tenantId', 'userId'])
export class UserRoleEntity {
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
   * 用户 ID。
   */
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  /**
   * 角色 ID。
   */
  @Column({ name: 'role_id', type: 'varchar', length: 36 })
  roleId!: string;

  /**
   * 创建时间。
   */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}

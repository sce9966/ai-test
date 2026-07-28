import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 角色-菜单关联（租户隔离；供动态菜单下发）。
 */
@Entity('role_menus')
@Index('uk_role_menus_tenant_role_menu', ['tenantId', 'roleId', 'menuId'], { unique: true })
@Index('idx_role_menus_tenant_role', ['tenantId', 'roleId'])
export class RoleMenuEntity {
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
   * 菜单 ID。
   */
  @Column({ name: 'menu_id', type: 'varchar', length: 36 })
  menuId!: string;

  /**
   * 创建时间。
   */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}

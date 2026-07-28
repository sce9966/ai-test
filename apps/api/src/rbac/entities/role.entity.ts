import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 角色状态。
 */
export enum RoleStatus {
  /** 启用 */
  Active = 'active',
  /** 禁用 */
  Disabled = 'disabled',
}

/**
 * 角色实体（共享库 + `tenant_id` 行级多租户）。
 */
@Entity('roles')
@Index('uk_roles_tenant_code', ['tenantId', 'code'], { unique: true })
@Index('idx_roles_tenant_id', ['tenantId'])
export class RoleEntity {
  /**
   * 主键（UUID）。
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * 租户 ID：列表/详情/更新/删除查询必须带此条件。
   */
  @Column({ name: 'tenant_id', type: 'varchar', length: 36 })
  tenantId!: string;

  /**
   * 角色编码（租户内唯一）。
   */
  @Column({ type: 'varchar', length: 64 })
  code!: string;

  /**
   * 显示名称。
   */
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  /**
   * 说明。
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  /**
   * 状态。
   */
  @Column({ type: 'varchar', length: 32, default: RoleStatus.Active })
  status!: RoleStatus;

  /**
   * 创建时间。
   */
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  /**
   * 更新时间。
   */
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}

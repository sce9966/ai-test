import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 用户状态枚举。
 */
export enum UserStatus {
  /** 启用 */
  Active = 'active',
  /** 禁用 */
  Disabled = 'disabled',
}

/**
 * 用户实体（共享库 + `tenant_id` 行级多租户）。
 */
@Entity('users')
@Index('uk_users_tenant_username', ['tenantId', 'username'], { unique: true })
@Index('idx_users_tenant_id', ['tenantId'])
export class UserEntity {
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
   * 登录用户名（租户内唯一）。
   */
  @Column({ type: 'varchar', length: 64 })
  username!: string;

  /**
   * 显示名称。
   */
  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string;

  /**
   * 密码哈希（bcryptjs，成本因子 ≥ 12）。
   */
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  /**
   * 账号状态。
   */
  @Column({ type: 'varchar', length: 32, default: UserStatus.Active })
  status!: UserStatus;

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

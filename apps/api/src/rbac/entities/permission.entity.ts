import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 权限码实体（全局目录，跨租户共享稳定码；授权关系在角色侧按租户隔离）。
 */
@Entity('permissions')
@Index('uk_permissions_code', ['code'], { unique: true })
export class PermissionEntity {
  /**
   * 主键（UUID）。
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * 权限码（如 `system:user:list`），前后端对齐。
   */
  @Column({ type: 'varchar', length: 128 })
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

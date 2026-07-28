import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 菜单节点类型。
 */
export enum MenuType {
  /** 目录 */
  Directory = 'directory',
  /** 菜单（可路由） */
  Menu = 'menu',
  /** 按钮 / 操作点 */
  Button = 'button',
}

/**
 * 菜单状态。
 */
export enum MenuStatus {
  /** 启用 */
  Active = 'active',
  /** 禁用 */
  Disabled = 'disabled',
}

/**
 * 菜单实体（树形；租户隔离；可挂权限码供路由/按钮控制）。
 */
@Entity('menus')
@Index('idx_menus_tenant_id', ['tenantId'])
@Index('idx_menus_tenant_parent', ['tenantId', 'parentId'])
export class MenuEntity {
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
   * 父菜单 ID；根节点为空。
   */
  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId!: string | null;

  /**
   * 菜单名称。
   */
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  /**
   * 前端路由 path（目录/按钮可空）。
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  path!: string | null;

  /**
   * 前端组件路径（可选）。
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  component!: string | null;

  /**
   * 图标标识。
   */
  @Column({ type: 'varchar', length: 64, nullable: true })
  icon!: string | null;

  /**
   * 关联权限码（与 `permissions.code` 对齐；空表示仅结构节点）。
   */
  @Column({ name: 'permission_code', type: 'varchar', length: 128, nullable: true })
  permissionCode!: string | null;

  /**
   * 同级排序（越小越靠前）。
   */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  /**
   * 节点类型。
   */
  @Column({ type: 'varchar', length: 32, default: MenuType.Menu })
  type!: MenuType;

  /**
   * 状态。
   */
  @Column({ type: 'varchar', length: 32, default: MenuStatus.Active })
  status!: MenuStatus;

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

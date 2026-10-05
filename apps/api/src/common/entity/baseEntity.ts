import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 实体基类：主键、时间戳与审计人字段。
 */
export abstract class BaseEntity {
  /**
   * 主键 ID。
   */
  @ApiProperty({ description: '主键ID' })
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * 创建人用户 ID。
   */
  @ApiProperty({ description: '创建人用户ID', required: false })
  @Column({ type: 'int', nullable: true, comment: '创建人用户ID' })
  createdBy?: number | null;

  /**
   * 更新人用户 ID。
   */
  @ApiProperty({ description: '更新人用户ID', required: false })
  @Column({ type: 'int', nullable: true, comment: '更新人用户ID' })
  updatedBy?: number | null;

  /**
   * 创建时间。
   */
  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt!: Date;

  /**
   * 更新时间。
   */
  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt!: Date;

  /**
   * 软删除时间。
   */
  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({ type: 'datetime', comment: '删除时间', nullable: true })
  deletedAt?: Date | null;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 实体基类：主键与时间戳字段。
 */
export abstract class BaseEntity {
  /**
   * 主键 ID。
   */
  @ApiProperty({ description: '主键ID' })
  @PrimaryGeneratedColumn()
  id!: number;

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

import { BaseEntity } from '@/common/entity/baseEntity';
import { Status } from '@/common/interfaces/status';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

/**
 * 后台用户实体。
 */
@Entity({ name: 'users' })
export class User extends BaseEntity {
  /**
   * 用户昵称。
   */
  @ApiProperty({ description: '用户昵称' })
  @Column({ length: 12, comment: '用户昵称' })
  username!: string;

  /**
   * 用户密码（bcrypt 哈希）。
   */
  @ApiProperty({ description: '用户密码', required: false })
  @Column({ length: 64, comment: '用户密码', nullable: true, select: false })
  password?: string;

  /**
   * 用户状态。
   */
  @ApiProperty({ description: '用户状态' })
  @Column({
    type: 'tinyint',
    default: Status.CommonStatus.Enable,
    comment: '用户状态',
  })
  status!: number;

  /**
   * 性别。
   */
  @ApiProperty({ description: '用户性别' })
  @Column({ default: 1, comment: '用户性别' })
  sex!: number;

  /**
   * 邮箱。
   */
  @ApiProperty({ description: '用户邮箱', required: false })
  @Column({ length: 64, comment: '用户邮箱', default: 'default@qq.com' })
  email?: string;

  /**
   * 手机号。
   */
  @ApiProperty({ description: '用户手机号', required: false })
  @Column({ length: 64, nullable: true, comment: '用户手机号' })
  phone?: string;

  /**
   * 头像 URL。
   */
  @ApiProperty({ description: '用户头像', required: false })
  @Column({
    length: 300,
    nullable: true,
    default: '',
    comment: '用户头像',
  })
  avatar?: string;

  /**
   * 注册 IP。
   */
  @ApiProperty({ description: '注册IP', required: false })
  @Column({ length: 64, default: '', comment: '注册IP', nullable: true })
  registerIp?: string;

  /**
   * 最后登录 IP。
   */
  @ApiProperty({ description: '最后一次登录IP', required: false })
  @Column({ length: 64, default: '', comment: '最后一次登录IP', nullable: true })
  lastLoginIp?: string;

  /**
   * 微信 openId。
   */
  @ApiProperty({ description: '微信openId', required: false })
  @Column({ length: 64, default: '', comment: '微信openId', nullable: true })
  openId?: string;

  /**
   * 注册来源。
   */
  @ApiProperty({ description: '用户注册来源', required: false })
  @Column({ length: 64, comment: '用户注册来源', nullable: true })
  client?: string;
}

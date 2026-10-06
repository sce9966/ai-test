import { BaseEntity } from '@/common/entity/baseEntity';
import { Status } from '@/common/interfaces/status';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

/**
 * 虚拟商品实体（会员档与课程共用一张表）。
 */
@Entity({ name: 'virtual_goods' })
@Index('idx_virtual_goods_kind', ['kind'])
export class VirtualGoods extends BaseEntity {
  /**
   * 业务商品 ID（20 位）。
   */
  @ApiProperty({ description: '虚拟道具ID' })
  @Column({ length: 20, unique: true, comment: '虚拟道具ID' })
  goodsId!: string;

  /**
   * 商品类型：member 会员 / course 课程。
   */
  @ApiProperty({ description: '商品类型', enum: Status.VirtualGoodsKind })
  @Column({ length: 16, comment: '商品类型 member/course' })
  kind!: Status.VirtualGoodsKind;

  /**
   * 名称。
   */
  @ApiProperty({ description: '名称' })
  @Column({ length: 20, comment: '名称' })
  name!: string;

  /**
   * 单价。
   */
  @ApiProperty({ description: '单价' })
  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单价' })
  price!: string;

  /**
   * 划线价。
   */
  @ApiProperty({ description: '划线价' })
  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '划线价' })
  linePrice!: string;

  /**
   * 备注。
   */
  @ApiProperty({ description: '备注' })
  @Column({ length: 1024, comment: '备注' })
  remark!: string;

  /**
   * 封面 URL 列表。
   */
  @ApiProperty({ description: '封面URL列表', type: [String] })
  @Column({ type: 'simple-json', comment: '封面URL列表' })
  coverUrls!: string[];

  /**
   * 有效时长（天）。
   */
  @ApiProperty({ description: '有效时长（天）' })
  @Column({ type: 'int', comment: '有效时长（天）' })
  durationDays!: number;

  /**
   * 上下架状态。
   */
  @ApiProperty({ description: '上下架状态' })
  @Column({
    type: 'tinyint',
    default: Status.GoodsShelfStatus.On,
    comment: '上下架状态 0下架 1上架',
  })
  status!: Status.GoodsShelfStatus;

  /**
   * 副标题。
   */
  @ApiProperty({ description: '副标题', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true, comment: '副标题' })
  subtitle?: string | null;

  /**
   * 排序。
   */
  @ApiProperty({ description: '排序', required: false })
  @Column({ type: 'int', nullable: true, default: 0, comment: '排序' })
  sort?: number | null;

  /**
   * 分组名称。
   */
  @ApiProperty({ description: '分组', required: false })
  @Column({ type: 'varchar', length: 64, nullable: true, comment: '分组' })
  groupName?: string | null;

  /**
   * 微信虚拟支付道具同步状态。
   */
  @ApiProperty({ description: '虚拟支付道具同步状态' })
  @Column({
    type: 'tinyint',
    default: Status.XpayGoodsSyncStatus.None,
    comment: '虚拟支付同步 0未同步 1已上传 2已发布 3失败',
  })
  xpaySyncStatus!: Status.XpayGoodsSyncStatus;

  /**
   * 最近一次同步失败原因。
   */
  @ApiProperty({ description: '虚拟支付同步信息', required: false })
  @Column({ type: 'varchar', length: 512, nullable: true, comment: '虚拟支付同步信息' })
  xpaySyncMessage?: string | null;
}

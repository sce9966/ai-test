import { BaseEntity } from '@/common/entity/baseEntity';
import { Status } from '@/common/interfaces/status';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商品 SKU 实体：会员卡档位价格与虚拟支付道具绑定。
 */
@Entity({ name: 'skus' })
export class Sku extends BaseEntity {
  /**
   * 商品 ID，须与小程序虚拟支付道具 ID 保持一致。
   */
  @ApiProperty({ description: '商品 ID' })
  @Index({ unique: true })
  @Column({ length: 64, comment: '商品 ID' })
  productId!: string;

  /**
   * 商品名称（如月卡 / 季卡 / 年卡）。
   */
  @ApiProperty({ description: '商品名称' })
  @Column({ length: 64, comment: '商品名称' })
  name!: string;

  /**
   * 现价（成交价以服务端为准）。
   */
  @ApiProperty({ description: '现价', example: '29.90' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '现价',
  })
  price!: string;

  /**
   * 划线价；现价等于原价时可为空。
   */
  @ApiProperty({ description: '划线价', required: false, example: '39.90' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '划线价',
  })
  linePrice?: string | null;

  /**
   * 会员时长（天）。
   */
  @ApiProperty({ description: '时长（天）', example: 30 })
  @Column({ type: 'int', comment: '时长（天）' })
  durationDays!: number;

  /**
   * 微信虚拟支付道具 ID；未绑定则下单可能报错。
   */
  @ApiProperty({ description: '虚拟支付道具 ID', required: false })
  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: '虚拟支付道具 ID',
  })
  virtualPayItemId?: string | null;

  /**
   * 上下架状态。
   */
  @ApiProperty({ description: '上下架状态：1 上架，0 下架' })
  @Column({
    type: 'tinyint',
    default: Status.SkuShelfStatus.On,
    comment: '上下架状态：1 上架，0 下架',
  })
  status!: number;
}

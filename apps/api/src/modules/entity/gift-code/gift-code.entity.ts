import { BaseEntity } from '@/common/entity/baseEntity';
import { Status } from '@/common/interfaces/status';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

/**
 * 虚拟商品与兑换码关系实体。
 */
@Entity({ name: 'gift_codes' })
@Index('idx_gift_codes_goods_id', ['goodsId'])
export class GiftCode extends BaseEntity {
  /**
   * 兑换码。
   */
  @ApiProperty({ description: '兑换码' })
  @Column({ length: 64, unique: true, comment: '兑换码' })
  code!: string;

  /**
   * 关联虚拟商品业务 ID。
   */
  @ApiProperty({ description: '关联虚拟商品ID' })
  @Column({ length: 20, comment: '关联虚拟商品ID' })
  goodsId!: string;

  /**
   * 兑换码状态。
   */
  @ApiProperty({ description: '状态' })
  @Column({
    type: 'tinyint',
    default: Status.GiftCodeStatus.Unused,
    comment: '状态 0未使用 1已绑定 2已作废',
  })
  status!: Status.GiftCodeStatus;

  /**
   * 关联订单号（一单一码）。
   */
  @ApiProperty({ description: '关联订单号', required: false })
  @Column({ type: 'varchar', length: 64, unique: true, nullable: true, comment: '关联订单号' })
  orderNo?: string | null;
}

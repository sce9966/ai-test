import { BaseEntity } from '@/common/entity/baseEntity';
import { Status } from '@/common/interfaces/status';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单实体。
 */
@Entity({ name: 'orders' })
@Index('idx_orders_goods_id', ['goodsId'])
@Index('idx_orders_user_id', ['userId'])
export class Order extends BaseEntity {
  /**
   * 付款单号。
   */
  @ApiProperty({ description: '付款单号' })
  @Column({ length: 64, unique: true, comment: '付款单号' })
  orderNo!: string;

  /**
   * 支付状态。
   */
  @ApiProperty({ description: '支付状态' })
  @Column({
    type: 'tinyint',
    default: Status.PayStatus.Unpaid,
    comment: '支付状态 0未支付 1成功 2失败',
  })
  payStatus!: Status.PayStatus;

  /**
   * 订单状态。
   */
  @ApiProperty({ description: '订单状态' })
  @Column({
    type: 'tinyint',
    default: Status.OrderStatus.Normal,
    comment: '订单状态 0正常 1完结',
  })
  orderStatus!: Status.OrderStatus;

  /**
   * 关联用户 ID。
   */
  @ApiProperty({ description: '关联用户ID' })
  @Column({ type: 'int', comment: '关联用户ID' })
  userId!: number;

  /**
   * 用户名称快照。
   */
  @ApiProperty({ description: '用户名称' })
  @Column({ length: 64, comment: '用户名称' })
  userName!: string;

  /**
   * 关联虚拟商品业务 ID。
   */
  @ApiProperty({ description: '关联商品ID' })
  @Column({ length: 20, comment: '关联商品ID' })
  goodsId!: string;

  /**
   * 商品名称快照。
   */
  @ApiProperty({ description: '商品名称' })
  @Column({ length: 20, comment: '商品名称' })
  goodsName!: string;

  /**
   * 订单金额。
   */
  @ApiProperty({ description: '金额' })
  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '金额' })
  amount!: string;
}

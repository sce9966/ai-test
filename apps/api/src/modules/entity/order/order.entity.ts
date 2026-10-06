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

  /**
   * 金额（分），与微信 goodsPrice 对齐。
   */
  @ApiProperty({ description: '金额（分）' })
  @Column({ type: 'int', default: 0, comment: '金额（分）' })
  amountFen!: number;

  /**
   * 购买数量。
   */
  @ApiProperty({ description: '购买数量' })
  @Column({ type: 'int', default: 1, comment: '购买数量' })
  quantity!: number;

  /**
   * 虚拟支付环境：0 现网 / 1 沙箱。
   */
  @ApiProperty({ description: '虚拟支付环境' })
  @Column({ type: 'tinyint', default: 0, comment: '虚拟支付环境 0现网 1沙箱' })
  env!: number;

  /**
   * 客户端平台（ios/android/windows/devtools 等）。
   */
  @ApiProperty({ description: '客户端平台', required: false })
  @Column({ type: 'varchar', length: 32, nullable: true, comment: '客户端平台' })
  platform?: string | null;

  /**
   * 支付渠道：wechat / apple。
   */
  @ApiProperty({ description: '支付渠道' })
  @Column({ type: 'varchar', length: 16, default: 'wechat', comment: '支付渠道 wechat/apple' })
  payChannel!: string;

  /**
   * 微信侧订单号。
   */
  @ApiProperty({ description: '微信侧订单号', required: false })
  @Column({ type: 'varchar', length: 64, nullable: true, comment: '微信侧订单号' })
  wxOrderId?: string | null;

  /**
   * 发货状态。
   */
  @ApiProperty({ description: '发货状态' })
  @Column({
    type: 'tinyint',
    default: Status.DeliverStatus.Pending,
    comment: '发货状态 0待发货 1已发货',
  })
  deliverStatus!: Status.DeliverStatus;

  /**
   * 已交付兑换码。
   */
  @ApiProperty({ description: '已交付兑换码', required: false })
  @Column({ type: 'varchar', length: 64, nullable: true, comment: '已交付兑换码' })
  deliveredCode?: string | null;

  /**
   * 是否已通过推送确认发货（无需再调 notify_provide_goods）。
   */
  @ApiProperty({ description: '推送已确认发货' })
  @Column({ type: 'tinyint', default: 0, comment: '推送已确认发货 0否 1是' })
  deliverNotifyAcked!: number;

  /**
   * 是否已调用 notify_provide_goods 补偿。
   */
  @ApiProperty({ description: '已补偿通知发货' })
  @Column({ type: 'tinyint', default: 0, comment: '已补偿通知发货 0否 1是' })
  provideGoodsNotified!: number;

  /**
   * 微信订单状态（query_order.status）。
   */
  @ApiProperty({ description: '微信订单状态', required: false })
  @Column({ type: 'int', nullable: true, comment: '微信订单状态' })
  wxOrderStatus?: number | null;

  /**
   * 退款单号。
   */
  @ApiProperty({ description: '退款单号', required: false })
  @Column({ type: 'varchar', length: 64, nullable: true, comment: '退款单号' })
  refundOrderNo?: string | null;
}

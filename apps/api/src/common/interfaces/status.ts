/**
 * 全局状态枚举命名空间。
 */
export namespace Status {
  /**
   * 通用启用 / 禁用状态。
   */
  export enum CommonStatus {
    /** 启用 */
    Enable = 1,
    /** 禁用 */
    Disable = 0,
  }

  /**
   * 虚拟商品上下架状态。
   */
  export enum GoodsShelfStatus {
    /** 下架 */
    Off = 0,
    /** 上架 */
    On = 1,
  }

  /**
   * 虚拟商品类型。
   */
  export enum VirtualGoodsKind {
    /** 会员 */
    Member = 'member',
    /** 课程 / 商品 */
    Course = 'course',
  }

  /**
   * 兑换码状态。
   */
  export enum GiftCodeStatus {
    /** 未使用 */
    Unused = 0,
    /** 已绑定订单 */
    Bound = 1,
    /** 已作废 */
    Voided = 2,
  }

  /**
   * 订单支付状态。
   */
  export enum PayStatus {
    /** 未支付 */
    Unpaid = 0,
    /** 支付成功 */
    Success = 1,
    /** 支付失败 */
    Failed = 2,
    /** 已退款 */
    Refunded = 3,
  }

  /**
   * 订单业务状态。
   */
  export enum OrderStatus {
    /** 正常 */
    Normal = 0,
    /** 完结 */
    Finished = 1,
  }

  /**
   * 订单发货状态。
   */
  export enum DeliverStatus {
    /** 待发货 */
    Pending = 0,
    /** 已发货 */
    Delivered = 1,
  }

  /**
   * 虚拟支付道具同步状态。
   */
  export enum XpayGoodsSyncStatus {
    /** 未同步 */
    None = 0,
    /** 已上传开发版 */
    Uploaded = 1,
    /** 已发布现网 */
    Published = 2,
    /** 同步失败 */
    Failed = 3,
  }
}

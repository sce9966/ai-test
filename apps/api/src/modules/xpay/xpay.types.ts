/**
 * 微信 query_order 返回的订单结构。
 */
export interface XpayOrderInfo {
  order_id?: string;
  wx_order_id?: string;
  status?: number;
  order_fee?: number;
  paid_fee?: number;
  left_fee?: number;
  order_type?: number;
  paid_time?: number;
  provide_time?: number;
}

/**
 * 微信 /xpay 通用响应。
 */
export interface XpayApiResult {
  errcode?: number;
  errmsg?: string;
  order?: XpayOrderInfo;
  refund_order_id?: string;
  refund_wx_order_id?: string;
  pay_order_id?: string;
  pay_wx_order_id?: string;
  status?: number;
  upload_item?: Array<{
    id?: string;
    upload_status?: number;
    errmsg?: string;
  }>;
  publish_item?: Array<{
    id?: string;
    publish_status?: number;
    errmsg?: string;
  }>;
}

/**
 * 道具发货推送关键字段。
 */
export interface XpayGoodsDeliverNotify {
  event: 'xpay_goods_deliver_notify';
  openId: string;
  outTradeNo: string;
  env: number;
  productId?: string;
  quantity?: number;
  attach?: string;
}

/**
 * 退款推送关键字段。
 */
export interface XpayRefundNotify {
  event: 'xpay_refund_notify';
  openId: string;
  mchOrderId?: string;
  wxOrderId?: string;
  retCode: number;
  mchRefundId?: string;
}

/**
 * iOS 退款问询。
 */
export interface XpayIosRefundQueryNotify {
  event: 'xpay_subscribe_ios_refund_query_notify';
  payOrderId?: string;
  productId?: string;
  provideStatus?: string;
}

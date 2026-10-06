import { registerAs } from '@nestjs/config';

/**
 * 微信虚拟支付（道具直购）配置。
 *
 * `env`：0 现网 / 1 沙箱。沙箱仅可用于 Android 等微信支付通路，iOS Apple 支付只能走现网。
 */
export default registerAs('wechatXpay', () => ({
  enabled: process.env.WECHAT_XPAY_ENABLED === 'true',
  offerId: process.env.WECHAT_XPAY_OFFER_ID ?? '',
  appKey: process.env.WECHAT_XPAY_APPKEY ?? '',
  sandboxAppKey: process.env.WECHAT_XPAY_SANDBOX_APPKEY ?? '',
  env: Number(process.env.WECHAT_XPAY_ENV ?? 0) === 1 ? 1 : 0,
  token: process.env.WECHAT_XPAY_TOKEN ?? '',
  encodingAesKey: process.env.WECHAT_XPAY_AES_KEY ?? '',
}));

import { registerAs } from '@nestjs/config';

/**
 * 微信小程序服务端配置。
 */
export default registerAs('wechatMini', () => ({
  appId: process.env.WECHAT_MINI_APPID ?? '',
  appSecret: process.env.WECHAT_MINI_SECRET ?? '',
}));

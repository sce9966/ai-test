/**
 * 腾讯云 COS 上传配置（从环境变量读取，勿硬编码密钥）。
 */
export const tenantCosConfig = {
  cosBucket: process.env.COS_BUCKET || '',
  cosRegion: process.env.COS_REGION || '',
  cosSecretId: process.env.COS_SECRET_ID || '',
  cosSecretKey: process.env.COS_SECRET_KEY || '',
  tencentCosAcceleratedDomain: process.env.COS_ACCELERATED_DOMAIN || '',
};

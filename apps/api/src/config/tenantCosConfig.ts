import { registerAs } from '@nestjs/config';

/**
 * 腾讯云 COS 上传配置。
 */
export interface TenantCosConfig {
  cosBucket: string;
  cosRegion: string;
  cosSecretId: string;
  cosSecretKey: string;
  tencentCosAcceleratedDomain: string;
}

/**
 * 腾讯云 COS 上传配置（从环境变量读取，勿硬编码密钥）。
 */
export default registerAs(
  'tenantCos',
  (): TenantCosConfig => ({
    cosBucket: process.env.COS_BUCKET || '',
    cosRegion: process.env.COS_REGION || '',
    cosSecretId: process.env.COS_SECRET_ID || '',
    cosSecretKey: process.env.COS_SECRET_KEY || '',
    tencentCosAcceleratedDomain: process.env.COS_ACCELERATED_DOMAIN || '',
  }),
);

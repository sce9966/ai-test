import { registerAs } from '@nestjs/config';

/**
 * 鉴权业务配置：默认租户与演示账号种子开关。
 */
export default registerAs('auth', () => ({
  defaultTenantId: process.env.AUTH_DEFAULT_TENANT_ID ?? 'default',
  seedDemoUser:
    process.env.AUTH_SEED_DEMO_USER === 'true' || process.env.AUTH_SEED_DEMO_USER === '1',
  demoUsername: process.env.AUTH_DEMO_USERNAME ?? 'admin',
  demoPassword: process.env.AUTH_DEMO_PASSWORD ?? 'Admin@123456',
}));

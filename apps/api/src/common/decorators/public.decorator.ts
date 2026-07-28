import { SetMetadata } from '@nestjs/common';

/**
 * 标记路由为公开接口（跳过全局 JWT 守卫）。
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 将当前 Handler / Controller 标记为无需鉴权。
 *
 * @returns 元数据装饰器
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

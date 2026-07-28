import { SetMetadata } from '@nestjs/common';

/**
 * 权限码元数据键。
 */
export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

/**
 * 声明接口所需权限码；需全部满足（AND），否则返回 403。
 *
 * @param codes 一个或多个权限码
 * @returns 元数据装饰器
 */
export const RequirePermissions = (...codes: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, codes);

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { JwtPayloadUser } from '../../auth/interfaces/jwt-payload.interface';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RbacService } from '../rbac.service';

/**
 * 权限守卫：在 JWT 鉴权之后按 `@RequirePermissions` 校验权限码；失败返回 403。
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  /**
   * 判断当前用户是否满足路由声明的权限码。
   *
   * @param context 执行上下文
   * @returns 是否放行
   * @throws UnauthorizedException 缺少鉴权用户
   * @throws ForbiddenException 权限不足
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayloadUser }>();
    const user = request.user;
    if (!user?.userId || !user?.tenantId) {
      throw new UnauthorizedException('未登录或令牌无效');
    }

    const allowed = await this.rbacService.userHasAllPermissions(
      user.tenantId,
      user.userId,
      required,
    );
    if (!allowed) {
      throw new ForbiddenException('权限不足');
    }
    return true;
  }
}

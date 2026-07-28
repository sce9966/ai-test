import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayloadUser } from '../../auth/interfaces/jwt-payload.interface';

/**
 * 从请求中提取当前鉴权用户（由 JwtStrategy 注入）。
 *
 * @param _data 未使用
 * @param ctx 执行上下文
 * @returns JWT 载荷用户信息
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayloadUser }>();
    return request.user;
  },
);

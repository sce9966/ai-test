import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisCacheService } from '../../modules/redisCache/redisCache.service';
import { JwtPayload } from '../interfaces/jwt-payload';

/**
 * JWT + Redis 鉴权守卫：校验 Bearer Token 并将用户信息挂到 request.user。
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  /**
   * @param context 执行上下文
   * @returns 是否放行
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = payload;
      await this.redisCacheService.checkTokenAuth(token, request);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
  }

  /**
   * 从 Authorization 头提取 Bearer Token。
   *
   * @param request Express 请求
   */
  private extractBearerToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

/** 兼容参考项目命名 */
export { AuthGuard as APIJSONAuthGuard };

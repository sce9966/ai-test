import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_RESULT_KEY } from '../decorators/skipResult.decorator';
import { Result } from '../result';

/**
 * 响应拦截器：将控制器返回值统一包装为 {@link Result}。
 */
@Injectable()
export class ResultInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  /**
   * @param context 执行上下文
   * @param next 下游处理器
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_RESULT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data: unknown) => {
        if (data instanceof Result) {
          return data;
        }
        return Result.success(data);
      }),
    );
  }
}

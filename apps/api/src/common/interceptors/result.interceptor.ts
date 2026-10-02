import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../result';

/**
 * 响应拦截器：将控制器返回值统一包装为 {@link Result}。
 */
@Injectable()
export class ResultInterceptor implements NestInterceptor {
  /**
   * @param _context 执行上下文
   * @param next 下游处理器
   */
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
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

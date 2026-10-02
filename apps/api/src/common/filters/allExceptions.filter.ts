import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Result } from '../result';

/**
 * 全局异常过滤器：将未捕获异常统一包装为 {@link Result}。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * @param exception 捕获到的异常
   * @param host 请求上下文
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    Logger.error(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionRes: unknown =
      exception instanceof HttpException ? exception.getResponse() : 'internal server error';

    let message: string | string[] = 'internal server error';
    if (typeof exceptionRes === 'string') {
      message = exceptionRes;
    } else if (exceptionRes && typeof exceptionRes === 'object' && 'message' in exceptionRes) {
      message = (exceptionRes as { message: string | string[] }).message;
    }

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(statusCode);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(Result.fail(statusCode, Array.isArray(message) ? message[0] : message));
  }
}

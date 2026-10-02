import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { Result } from '../result';

/**
 * TypeORM 查询失败过滤器：将常见数据库错误转为可读业务异常。
 */
@Catch(QueryFailedError)
export class TypeOrmQueryFailedFilter implements ExceptionFilter {
  /**
   * @param exception 查询失败异常
   * @param host 请求上下文
   */
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const driverError = exception.driverError as { code?: string } | undefined;

    if (driverError?.code === 'ER_DUP_ENTRY') {
      response.status(400).send(Result.fail(400, '该记录已经存在，请勿重复添加！'));
      return;
    }

    Logger.error(exception.message, 'TypeOrmQueryFailedFilter');
    response.status(500).send(Result.fail(500, `数据库查询失败: ${exception.message}`));
  }
}

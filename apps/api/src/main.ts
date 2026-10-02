import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/allExceptions.filter';
import { TypeOrmQueryFailedFilter } from './common/filters/typeOrmQueryFailed.filter';
import { createSwagger } from './common/swagger';
import { APIPREFIX, NAMESPACE, PORT } from './config/main';

/**
 * 应用入口：创建 Nest 实例，挂载全局管道 / 过滤器 / Swagger 并监听端口。
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', PORT);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const apiPrefix = configService.get<string>('app.apiPrefix', APIPREFIX);
  const namespace = configService.get<string>('app.namespace', NAMESPACE);

  app.enableCors();
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new TypeOrmQueryFailedFilter(), new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  createSwagger(app);

  const server = await app.listen(port);
  server.setTimeout(5 * 60 * 1000);
  Logger.log(
    `API listening on http://localhost:${port}${apiPrefix} (${nodeEnv})`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger: http://localhost:${port}/${namespace}/swagger/docs`,
    'Bootstrap',
  );
}

void bootstrap();

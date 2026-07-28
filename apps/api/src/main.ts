import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * 应用入口：创建 Nest 实例、全局校验管道并监听配置端口。
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port} (${nodeEnv})`, 'Bootstrap');
}

void bootstrap();

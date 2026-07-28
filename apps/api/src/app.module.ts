import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { envValidationSchema } from './config/env.validation';

/**
 * 根模块：加载全局配置（端口 / MySQL / Redis 占位），不接线真实 DB 或缓存。
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, redisConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

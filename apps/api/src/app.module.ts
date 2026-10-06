import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResultInterceptor } from './common/interceptors/result.interceptor';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import wechatMiniConfig from './config/wechat-mini.config';
import redisConfig from './config/redis.config';
import tenantCosConfig from './config/tenantCosConfig';
import { AuthModule } from './modules/auth/auth.module';
import { GiftCodeModule } from './modules/gift-code/gift-code.module';
import { OrderModule } from './modules/order/order.module';
import { RedisCacheModule } from './modules/redisCache/redisCache.module';
import { UploadModule } from './modules/upload/upload.module';
import { VirtualGoodsModule } from './modules/virtual-goods/virtual-goods.module';
import { WechatMiniModule } from './modules/wechat-mini/wechat-mini.module';

/**
 * 根模块：配置、数据库、Redis，以及鉴权、上传、业务实体与微信小程序模块。
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, redisConfig, wechatMiniConfig, tenantCosConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize') ?? false,
        charset: 'utf8mb4',
        timezone: '+08:00',
        logging: configService.get<string>('app.nodeEnv') === 'development',
      }),
    }),
    RedisCacheModule,
    AuthModule,
    UploadModule,
    VirtualGoodsModule,
    GiftCodeModule,
    OrderModule,
    WechatMiniModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultInterceptor,
    },
  ],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

/**
 * 全局 Redis 模块：基于配置创建 ioredis 客户端。
 */
@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      /**
       * @param configService 配置服务
       * @returns ioredis 客户端
       */
      useFactory: (configService: ConfigService): Redis => {
        const password = configService.get<string | undefined>('redis.password');
        return new Redis({
          host: configService.get<string>('redis.host', '127.0.0.1'),
          port: configService.get<number>('redis.port', 6379),
          password: password || undefined,
          db: configService.get<number>('redis.db', 0),
          lazyConnect: false,
          maxRetriesPerRequest: 3,
        });
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}

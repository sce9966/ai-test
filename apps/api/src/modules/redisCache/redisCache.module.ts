import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisCacheService } from './redisCache.service';

/**
 * Redis 缓存全局模块，供鉴权与验证码等能力复用。
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('redis.host');
        const port = configService.get<number>('redis.port');
        const password = configService.get<string>('redis.password');
        const username = configService.get<string>('redis.username');
        const db = configService.get<number>('redis.db') ?? 0;

        if (!host || !port) {
          Logger.error(
            '未配置 Redis 连接信息，请检查 REDIS_HOST / REDIS_PORT',
            'RedisCacheModule',
          );
          return null;
        }

        const client = createClient({
          socket: { host, port },
          username: username || undefined,
          password: password || undefined,
          database: db,
        });

        client.on('error', () => {
          Logger.error('Redis 连接失败', 'RedisCacheModule');
        });
        client.on('ready', () => {
          Logger.debug('Redis 连接成功', 'RedisCacheModule');
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
    RedisCacheService,
  ],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}

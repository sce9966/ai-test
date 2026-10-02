import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '../../common/guards/auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import jwtConfig from '../../config/jwt';
import { User } from '../entity/user/user.entity';
import { RedisCacheModule } from '../redisCache/redisCache.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * 鉴权全局模块：JWT、用户仓储与守卫。
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RedisCacheModule,
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions =>
        ({
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.signOptions.expiresIn,
          },
        }) as JwtModuleOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, JwtAuthGuard],
  exports: [AuthService, AuthGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

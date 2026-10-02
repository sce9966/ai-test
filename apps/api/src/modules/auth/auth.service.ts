import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Result } from '../../common/result';
import { getClientIp } from '../../common/utils/getClientIp';
import { User } from '../entity/user/user.entity';
import { RedisCacheService } from '../redisCache/redisCache.service';
import { LoginByPhoneDto, SendPhoneCodeDto, UserRegisterByPhoneDto } from './dto/auth.dto';

/**
 * 鉴权服务：注册、登录、验证码与用户信息。
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisCacheService: RedisCacheService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 校验手机号注册参数唯一性。
   *
   * @param body 注册 DTO
   */
  private async verifyUserRegisterByPhone(body: UserRegisterByPhoneDto): Promise<void> {
    const { username, phone } = body;
    const user = await this.userRepository.findOne({ where: [{ username }, { phone }] });
    if (user && user.username === username) {
      throw new HttpException('用户名已存在、请更换用户名！', HttpStatus.BAD_REQUEST);
    }
    if (user && user.phone === phone) {
      throw new HttpException('当前手机号已注册、请勿重复注册！', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 查询用户公开信息。
   *
   * @param userId 用户 ID
   */
  private async getUserInfo(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'email', 'phone', 'avatar',],
    });
    if (!user) {
      throw new HttpException('用户不存在！', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  /**
   * 校验手机号 + 密码登录。
   *
   * @param body 登录 DTO
   */
  private async validateLoginUser(body: LoginByPhoneDto): Promise<User> {
    const { phone, password } = body;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :phone', { phone })
      .getOne();

    if (!user) {
      throw new HttpException('用户不存在、请先注册！', HttpStatus.BAD_REQUEST);
    }
    if (!user.password) {
      throw new HttpException('密码错误、请重新输入！', HttpStatus.BAD_REQUEST);
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      throw new HttpException('密码错误、请重新输入！', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  /**
   * 手机号 + 验证码注册。
   *
   * @param body 注册 DTO
   * @param req Express 请求（用于解析 IP）
   */
  async registerByPhone(body: UserRegisterByPhoneDto, req: Request): Promise<Result<null>> {
    const { username, password, phone, phoneCode } = body;
    await this.verifyUserRegisterByPhone(body);

    const key = `PHONECODE:${phone}`;
    const redisPhoneCode = await this.redisCacheService.get({ key });
    if (!redisPhoneCode) {
      throw new HttpException('验证码已过期、请重新发送！', HttpStatus.BAD_REQUEST);
    }
    if (phoneCode !== redisPhoneCode) {
      throw new HttpException('验证码填写错误、请重新输入！', HttpStatus.BAD_REQUEST);
    }

    const registerIp = getClientIp(req);
    const hashPassword = bcrypt.hashSync(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashPassword,
      phone,
      registerIp,
      client: 'phone',
      status: 1,
    });
    await this.userRepository.save(user);
    return Result.success(null, '注册成功');
  }

  /**
   * 手机号 + 密码登录。
   *
   * @param body 登录 DTO
   */
  async loginByPhone(body: LoginByPhoneDto): Promise<Result<{ user: Partial<User>; accessToken: string }>> {
    const user = await this.validateLoginUser(body);
    const { username, id, email, openId, client, phone, avatar } = user;
    const token = await this.jwtService.signAsync({
      username,
      id,
      email,
      openId,
      client,
      phone,
    });
    await this.redisCacheService.saveToken(id, token);
    return Result.success(
      {
        user: { username, avatar, id },
        accessToken: token,
      },
      '登录成功',
    );
  }

  /**
   * 获取当前登录用户信息。
   *
   * @param userId 用户 ID
   */
  async getAuthUserInfo(userId: number): Promise<Result<User>> {
    const user = await this.getUserInfo(userId);
    return Result.success(user);
  }

  /**
   * 发送手机验证码（开发环境固定码，短信通道可后续接入）。
   *
   * @param body 发送验证码 DTO
   */
  async sendPhoneCode(body: SendPhoneCodeDto): Promise<Result<null>> {
    const { phone } = body;
    const key = `PHONECODE:${phone}`;
    const ttl = await this.redisCacheService.ttl(key);
    if (ttl && ttl > 0) {
      throw new HttpException(`${ttl}秒内不得重复发送短信！`, HttpStatus.BAD_REQUEST);
    }
    const code = '123456';
    await this.redisCacheService.set({ key, val: code }, 60);
    return Result.success(null, '验证码发送成功!');
  }
}

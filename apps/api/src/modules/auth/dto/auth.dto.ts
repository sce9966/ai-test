import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

/**
 * 手机号注册 DTO。
 */
export class UserRegisterByPhoneDto {
  @ApiProperty({ example: 'cooper', description: '用户名称' })
  @IsNotEmpty({ message: '用户名不能为空！' })
  @MinLength(2, { message: '用户名最低需要大于2位数！' })
  @MaxLength(12, { message: '用户名不得超过12位！' })
  username!: string;

  @ApiProperty({ example: '123456', description: '用户密码' })
  @IsNotEmpty({ message: '用户密码不能为空' })
  @MinLength(6, { message: '用户密码最低需要大于6位数！' })
  @MaxLength(30, { message: '用户密码最长不能超过30位数！' })
  password!: string;

  @ApiProperty({ example: '13415743355', description: '用户手机号码' })
  @IsPhoneNumber('CN', { message: '手机号码格式不正确！' })
  @IsNotEmpty({ message: '手机号码不能为空！' })
  phone!: string;

  @ApiProperty({ example: '123456', description: '手机验证码' })
  @IsNotEmpty({ message: '手机验证码不能为空！' })
  phoneCode!: string;
}

/**
 * 手机号登录 DTO。
 */
export class LoginByPhoneDto {
  @ApiProperty({ example: '13415743355', description: '手机号' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '手机号格式不正确！' })
  phone!: string;

  @ApiProperty({ example: '123456', description: '密码' })
  @IsNotEmpty({ message: '用户密码不能为空！' })
  @MinLength(6, { message: '用户密码最低需要大于6位数！' })
  @MaxLength(30, { message: '用户密码最长不能超过30位数！' })
  password!: string;
}

/**
 * 发送手机验证码 DTO。
 */
export class SendPhoneCodeDto {
  @ApiProperty({ example: '13415743355', description: '手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  @MinLength(11, { message: '手机号长度为11位' })
  @MaxLength(11, { message: '手机号长度为11位！' })
  phone!: string;

  @ApiProperty({ example: '2b4i1b4', description: '图形验证码KEY', required: false })
  @IsOptional()
  captchaId?: string;

  @ApiProperty({ example: '1g4d', description: '图形验证码', required: false })
  @IsOptional()
  captchaCode?: string;
}

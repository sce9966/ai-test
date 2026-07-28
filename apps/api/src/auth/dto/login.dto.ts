import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 登录请求体。
 */
export class LoginDto {
  /**
   * 租户标识（可选；缺省使用默认演示租户）。
   * 注意：业务租户上下文最终以服务端用户记录为准，不信任客户端随意指定跨租户身份。
   */
  @IsOptional()
  @IsString()
  @MaxLength(36)
  tenantId?: string;

  /**
   * 登录用户名。
   */
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username!: string;

  /**
   * 明文密码。
   */
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

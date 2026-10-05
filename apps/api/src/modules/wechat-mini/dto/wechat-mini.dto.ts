import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 小程序登录：wx.login 得到的临时登录凭证。
 */
export class WechatMiniLoginDto {
  @ApiProperty({ description: 'wx.login 返回的 js_code', example: '081xxxx' })
  @IsString()
  @IsNotEmpty({ message: '登录凭证 code 不能为空' })
  @MaxLength(128, { message: 'code 长度不合法' })
  code!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * 小程序创建道具直购单。
 */
export class CreateXpayOrderDto {
  @ApiProperty({ description: '虚拟商品 / 道具 ID' })
  @IsString()
  @IsNotEmpty({ message: '商品ID不能为空' })
  @MaxLength(20)
  goodsId!: string;

  @ApiProperty({ description: '客户端 platform，如 ios/android/windows/devtools' })
  @IsString()
  @IsNotEmpty({ message: 'platform 不能为空' })
  @MaxLength(32)
  platform!: string;

  @ApiPropertyOptional({ description: '购买数量', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  buyQuantity?: number;

  @ApiPropertyOptional({ description: '透传 attach' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  attach?: string;
}

/**
 * 客户端确认支付 / 查询同步。
 */
export class ConfirmXpayOrderDto {
  @ApiProperty({ description: '业务订单号' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  orderNo!: string;
}

/**
 * 后台发起退款。
 */
export class RefundXpayOrderDto {
  @ApiProperty({ description: '退款原因 0-5' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['0', '1', '2', '3', '4', '5'])
  refundReason!: string;

  @ApiProperty({ description: '退款来源 1客服 2用户 3其它' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['1', '2', '3'])
  reqFrom!: string;

  @ApiPropertyOptional({ description: '退款金额（分），默认剩余可退' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  refundFeeFen?: number;
}

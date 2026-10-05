import { Status } from '@/common/interfaces/status';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 订单列表查询 DTO。
 */
export class QueryOrderDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '付款单号' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  orderNo?: string;

  @ApiPropertyOptional({ description: '商品名称（模糊）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  goodsName?: string;

  @ApiPropertyOptional({ description: '用户名称（模糊）' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  userName?: string;

  @ApiPropertyOptional({ description: '支付状态', enum: Status.PayStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status.PayStatus, { message: '支付状态不正确' })
  payStatus?: Status.PayStatus;

  @ApiPropertyOptional({ description: '订单状态', enum: Status.OrderStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status.OrderStatus, { message: '订单状态不正确' })
  orderStatus?: Status.OrderStatus;
}

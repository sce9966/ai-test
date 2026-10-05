import { Status } from '@/common/interfaces/status';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * 批量导入兑换码 DTO。
 */
export class ImportGiftCodeDto {
  @ApiProperty({ description: '关联虚拟商品ID' })
  @IsString()
  @IsNotEmpty({ message: '商品ID不能为空' })
  @MaxLength(20)
  goodsId!: string;

  @ApiProperty({ description: '兑换码列表', type: [String] })
  @IsArray({ message: '兑换码必须为数组' })
  @ArrayMinSize(1, { message: '至少导入一条兑换码' })
  @IsString({ each: true })
  codes!: string[];
}

/**
 * 兑换码列表查询 DTO。
 */
export class QueryGiftCodeDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '兑换码（模糊）' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @ApiPropertyOptional({ description: '虚拟商品ID' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  goodsId?: string;

  @ApiPropertyOptional({ description: '商品名称（模糊）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  goodsName?: string;

  @ApiPropertyOptional({ description: '订单号' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  orderNo?: string;

  @ApiPropertyOptional({ description: '状态', enum: Status.GiftCodeStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status.GiftCodeStatus, { message: '状态不正确' })
  status?: Status.GiftCodeStatus;
}

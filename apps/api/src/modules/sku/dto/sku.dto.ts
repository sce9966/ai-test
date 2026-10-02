import { Status } from '@/common/interfaces/status';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 新增商品 SKU。
 */
export class CreateSkuDto {
  @ApiProperty({ example: 'vip_month', description: '商品 ID，须与虚拟支付道具 ID 一致' })
  @IsNotEmpty({ message: '商品 ID 不能为空' })
  @IsString()
  @MaxLength(64, { message: '商品 ID 不得超过 64 位' })
  productId!: string;

  @ApiProperty({ example: '月卡', description: '商品名称' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString()
  @MaxLength(64, { message: '商品名称不得超过 64 位' })
  name!: string;

  @ApiProperty({ example: 29.9, description: '现价' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '现价格式不正确' })
  @Min(0, { message: '现价不能小于 0' })
  price!: number;

  @ApiPropertyOptional({ example: 39.9, description: '划线价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '划线价格式不正确' })
  @Min(0, { message: '划线价不能小于 0' })
  linePrice?: number | null;

  @ApiProperty({ example: 30, description: '时长（天）' })
  @Type(() => Number)
  @IsInt({ message: '时长必须为整数' })
  @Min(1, { message: '时长至少为 1 天' })
  durationDays!: number;

  @ApiPropertyOptional({ example: 'vip_month', description: '虚拟支付道具 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: '虚拟支付道具 ID 不得超过 64 位' })
  virtualPayItemId?: string | null;

  @ApiPropertyOptional({
    example: Status.SkuShelfStatus.On,
    description: '上下架：1 上架，0 下架',
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([Status.SkuShelfStatus.On, Status.SkuShelfStatus.Off], {
    message: '上下架状态只能为 0 或 1',
  })
  status?: number;
}

/**
 * 编辑商品 SKU。
 */
export class UpdateSkuDto {
  @ApiPropertyOptional({ example: 'vip_month', description: '商品 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: '商品 ID 不得超过 64 位' })
  productId?: string;

  @ApiPropertyOptional({ example: '月卡', description: '商品名称' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: '商品名称不得超过 64 位' })
  name?: string;

  @ApiPropertyOptional({ example: 29.9, description: '现价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '现价格式不正确' })
  @Min(0, { message: '现价不能小于 0' })
  price?: number;

  @ApiPropertyOptional({ example: 39.9, description: '划线价' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: '划线价格式不正确' })
  @Min(0, { message: '划线价不能小于 0' })
  linePrice?: number | null;

  @ApiPropertyOptional({ example: 30, description: '时长（天）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '时长必须为整数' })
  @Min(1, { message: '时长至少为 1 天' })
  durationDays?: number;

  @ApiPropertyOptional({ example: 'vip_month', description: '虚拟支付道具 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: '虚拟支付道具 ID 不得超过 64 位' })
  virtualPayItemId?: string | null;

  @ApiPropertyOptional({
    example: Status.SkuShelfStatus.On,
    description: '上下架：1 上架，0 下架',
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([Status.SkuShelfStatus.On, Status.SkuShelfStatus.Off], {
    message: '上下架状态只能为 0 或 1',
  })
  status?: number;
}

/**
 * 切换上下架。
 */
export class UpdateSkuStatusDto {
  @ApiProperty({ example: Status.SkuShelfStatus.On, description: '上下架：1 上架，0 下架' })
  @Type(() => Number)
  @IsIn([Status.SkuShelfStatus.On, Status.SkuShelfStatus.Off], {
    message: '上下架状态只能为 0 或 1',
  })
  status!: number;
}

/**
 * 商品 SKU 分页查询。
 */
export class QuerySkuDto {
  @ApiPropertyOptional({ example: 1, description: '页码' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须为整数' })
  @Min(1, { message: '页码至少为 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: '每页条数' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须为整数' })
  @Min(1, { message: '每页条数至少为 1' })
  pageSize?: number = 20;

  @ApiPropertyOptional({ example: '月卡', description: '商品名称（模糊）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'vip_month', description: '商品 ID' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 1, description: '上下架：1 上架，0 下架' })
  @IsOptional()
  @Type(() => Number)
  @IsIn([Status.SkuShelfStatus.On, Status.SkuShelfStatus.Off], {
    message: '上下架状态只能为 0 或 1',
  })
  status?: number;
}

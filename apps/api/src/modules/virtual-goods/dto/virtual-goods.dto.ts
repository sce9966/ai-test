import { Status } from '@/common/interfaces/status';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 创建虚拟商品 DTO。
 */
export class CreateVirtualGoodsDto {
  @ApiProperty({ description: '商品类型', enum: Status.VirtualGoodsKind })
  @IsEnum(Status.VirtualGoodsKind, { message: '商品类型不正确' })
  kind!: Status.VirtualGoodsKind;

  @ApiProperty({ description: '名称', maxLength: 20 })
  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  @MaxLength(20, { message: '名称不得超过20个字符' })
  name!: string;

  @ApiProperty({ description: '单价' })
  @Type(() => Number)
  @IsNumber({}, { message: '单价必须为数字' })
  @Min(0, { message: '单价不能为负数' })
  price!: number;

  @ApiProperty({ description: '划线价' })
  @Type(() => Number)
  @IsNumber({}, { message: '划线价必须为数字' })
  @Min(0, { message: '划线价不能为负数' })
  linePrice!: number;

  @ApiProperty({ description: '备注', maxLength: 1024 })
  @IsString()
  @IsNotEmpty({ message: '备注不能为空' })
  @MaxLength(1024, { message: '备注不得超过1024个字符' })
  remark!: string;

  @ApiProperty({ description: '封面URL列表', type: [String] })
  @IsArray({ message: '封面必须为数组' })
  @ArrayMinSize(1, { message: '至少上传一张封面' })
  @IsString({ each: true, message: '封面必须为字符串' })
  coverUrls!: string[];

  @ApiProperty({ description: '有效时长（天）' })
  @Type(() => Number)
  @IsInt({ message: '有效时长必须为整数' })
  @Min(1, { message: '有效时长至少为1天' })
  durationDays!: number;

  @ApiPropertyOptional({ description: '上下架状态', enum: Status.GoodsShelfStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status.GoodsShelfStatus, { message: '状态不正确' })
  status?: Status.GoodsShelfStatus;

  @ApiPropertyOptional({ description: '副标题' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '副标题不得超过255个字符' })
  subtitle?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '排序必须为整数' })
  sort?: number;

  @ApiPropertyOptional({ description: '分组' })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: '分组不得超过64个字符' })
  groupName?: string;
}

/**
 * 更新虚拟商品 DTO（不可改 kind / goodsId）。
 */
export class UpdateVirtualGoodsDto extends PartialType(
  OmitType(CreateVirtualGoodsDto, ['kind'] as const),
) {}

/**
 * 虚拟商品列表查询 DTO。
 */
export class QueryVirtualGoodsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '商品类型', enum: Status.VirtualGoodsKind })
  @IsOptional()
  @IsEnum(Status.VirtualGoodsKind, { message: '商品类型不正确' })
  kind?: Status.VirtualGoodsKind;

  @ApiPropertyOptional({ description: '名称（模糊）' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({ description: '虚拟道具ID' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  goodsId?: string;

  @ApiPropertyOptional({ description: '上下架状态', enum: Status.GoodsShelfStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(Status.GoodsShelfStatus, { message: '状态不正确' })
  status?: Status.GoodsShelfStatus;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * 通用分页查询参数。
 */
export class PaginationQueryDto {
  /**
   * 页码。
   */
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须为整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  /**
   * 每页条数。
   */
  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页条数必须为整数' })
  @Min(1, { message: '每页条数最小为1' })
  @Max(100, { message: '每页条数最大为100' })
  pageSize?: number = 20;
}

/**
 * 分页列表结构。
 */
export interface PaginatedResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

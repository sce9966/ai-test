import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CreateSkuDto, QuerySkuDto, UpdateSkuDto, UpdateSkuStatusDto } from './dto/sku.dto';
import { SkuService } from './sku.service';

/**
 * 商品 SKU 控制器：会员卡档位与虚拟支付道具绑定。
 */
@ApiTags('商品 SKU')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('sku')
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  /**
   * 新增商品 SKU。
   */
  @Post()
  @ApiOperation({ summary: '新增商品 SKU' })
  create(@Body() body: CreateSkuDto) {
    return this.skuService.create(body);
  }

  /**
   * 分页查询商品 SKU。
   */
  @Get()
  @ApiOperation({ summary: '分页查询商品 SKU' })
  findAll(@Query() query: QuerySkuDto) {
    return this.skuService.findAll(query);
  }

  /**
   * 查询单个商品 SKU。
   */
  @Get(':id')
  @ApiOperation({ summary: '查询商品 SKU 详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skuService.findOne(id);
  }

  /**
   * 编辑商品 SKU。
   */
  @Put(':id')
  @ApiOperation({ summary: '编辑商品 SKU' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSkuDto) {
    return this.skuService.update(id, body);
  }

  /**
   * 切换上下架。
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '商品 SKU 上下架' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateSkuStatusDto) {
    return this.skuService.updateStatus(id, body);
  }

  /**
   * 删除商品 SKU。
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除商品 SKU' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skuService.remove(id);
  }
}

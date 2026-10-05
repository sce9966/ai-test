import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  CreateVirtualGoodsDto,
  QueryVirtualGoodsDto,
  UpdateVirtualGoodsDto,
} from './dto/virtual-goods.dto';
import { VirtualGoodsService } from './virtual-goods.service';

/**
 * 虚拟商品控制器。
 */
@ApiTags('虚拟商品')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('virtual-goods')
export class VirtualGoodsController {
  constructor(private readonly virtualGoodsService: VirtualGoodsService) {}

  /**
   * 新增虚拟商品。
   */
  @Post()
  @ApiOperation({ summary: '新增虚拟商品' })
  create(@Body() dto: CreateVirtualGoodsDto, @Req() req: Request) {
    return this.virtualGoodsService.create(dto, req.user!.id);
  }

  /**
   * 分页查询虚拟商品。
   */
  @Get()
  @ApiOperation({ summary: '查询虚拟商品列表' })
  findAll(@Query() query: QueryVirtualGoodsDto) {
    return this.virtualGoodsService.findAll(query);
  }

  /**
   * 查询虚拟商品详情。
   */
  @Get(':id')
  @ApiOperation({ summary: '查询虚拟商品详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.virtualGoodsService.findOne(id);
  }

  /**
   * 编辑虚拟商品。
   */
  @Put(':id')
  @ApiOperation({ summary: '编辑虚拟商品' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVirtualGoodsDto,
    @Req() req: Request,
  ) {
    return this.virtualGoodsService.update(id, dto, req.user!.id);
  }

  /**
   * 删除虚拟商品。
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除虚拟商品' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.virtualGoodsService.remove(id);
  }
}

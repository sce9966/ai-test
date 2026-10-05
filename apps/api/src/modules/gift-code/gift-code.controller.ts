import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ImportGiftCodeDto, QueryGiftCodeDto } from './dto/gift-code.dto';
import { GiftCodeService } from './gift-code.service';

/**
 * 兑换码控制器。
 */
@ApiTags('兑换码')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('gift-code')
export class GiftCodeController {
  constructor(private readonly giftCodeService: GiftCodeService) {}

  /**
   * 批量导入兑换码。
   */
  @Post('import')
  @ApiOperation({ summary: '批量导入兑换码' })
  import(@Body() dto: ImportGiftCodeDto, @Req() req: Request) {
    return this.giftCodeService.import(dto, req.user!.id);
  }

  /**
   * 分页查询兑换码。
   */
  @Get()
  @ApiOperation({ summary: '查询兑换码列表' })
  findAll(@Query() query: QueryGiftCodeDto) {
    return this.giftCodeService.findAll(query);
  }

  /**
   * 查询兑换码详情。
   */
  @Get(':id')
  @ApiOperation({ summary: '查询兑换码详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.giftCodeService.findOne(id);
  }

  /**
   * 作废兑换码。
   */
  @Patch(':id/void')
  @ApiOperation({ summary: '作废兑换码' })
  void(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.giftCodeService.void(id, req.user!.id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sku } from '../entity/sku/sku.entity';
import { SkuController } from './sku.controller';
import { SkuService } from './sku.service';

/**
 * 商品 SKU 模块：档位价格与虚拟支付道具绑定。
 */
@Module({
  imports: [TypeOrmModule.forFeature([Sku])],
  controllers: [SkuController],
  providers: [SkuService],
  exports: [SkuService],
})
export class SkuModule {}

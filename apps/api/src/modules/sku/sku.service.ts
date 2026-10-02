import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Status } from '../../common/interfaces/status';
import { Result } from '../../common/result';
import { Sku } from '../entity/sku/sku.entity';
import { CreateSkuDto, QuerySkuDto, UpdateSkuDto, UpdateSkuStatusDto } from './dto/sku.dto';

/**
 * 商品 SKU 服务：档位价格、虚拟支付道具绑定与上下架。
 */
@Injectable()
export class SkuService {
  constructor(
    @InjectRepository(Sku)
    private readonly skuRepository: Repository<Sku>,
  ) {}

  /**
   * 校验商品 ID 与虚拟支付道具 ID 一致（两者都填写时）。
   *
   * @param productId 商品 ID
   * @param virtualPayItemId 虚拟支付道具 ID
   */
  private assertProductIdMatchesVirtualPayItem(
    productId?: string,
    virtualPayItemId?: string | null,
  ): void {
    if (productId && virtualPayItemId && productId !== virtualPayItemId) {
      throw new HttpException(
        '商品 ID 必须与虚拟支付道具 ID 完全一致',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 校验商品 ID 唯一。
   *
   * @param productId 商品 ID
   * @param excludeId 排除的主键（编辑时）
   */
  private async assertProductIdUnique(productId: string, excludeId?: number): Promise<void> {
    const existed = await this.skuRepository.findOne({ where: { productId } });
    if (existed && existed.id !== excludeId) {
      throw new HttpException('商品 ID 已存在，请勿重复添加', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 按主键查询，不存在则抛出。
   *
   * @param id 主键
   */
  private async findSkuOrFail(id: number): Promise<Sku> {
    const sku = await this.skuRepository.findOne({ where: { id } });
    if (!sku) {
      throw new HttpException('商品 SKU 不存在', HttpStatus.NOT_FOUND);
    }
    return sku;
  }

  /**
   * 新增商品 SKU。
   *
   * @param body 创建参数
   */
  async create(body: CreateSkuDto) {
    this.assertProductIdMatchesVirtualPayItem(body.productId, body.virtualPayItemId);
    await this.assertProductIdUnique(body.productId);

    const sku = this.skuRepository.create({
      productId: body.productId,
      name: body.name,
      price: body.price.toFixed(2),
      linePrice: body.linePrice == null ? null : body.linePrice.toFixed(2),
      durationDays: body.durationDays,
      virtualPayItemId: body.virtualPayItemId ?? null,
      status: body.status ?? Status.SkuShelfStatus.On,
    });
    const saved = await this.skuRepository.save(sku);
    return Result.success(saved, '创建成功');
  }

  /**
   * 分页查询商品 SKU。
   *
   * @param query 查询参数
   */
  async findAll(query: QuerySkuDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: FindOptionsWhere<Sku> = {};

    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const [list, total] = await this.skuRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return Result.success({
      list,
      total,
      page,
      pageSize,
    });
  }

  /**
   * 查询单个商品 SKU。
   *
   * @param id 主键
   */
  async findOne(id: number) {
    const sku = await this.findSkuOrFail(id);
    return Result.success(sku);
  }

  /**
   * 编辑商品 SKU。
   *
   * @param id 主键
   * @param body 更新参数
   */
  async update(id: number, body: UpdateSkuDto) {
    const sku = await this.findSkuOrFail(id);
    const nextProductId = body.productId ?? sku.productId;
    const nextVirtualPayItemId =
      body.virtualPayItemId !== undefined ? body.virtualPayItemId : sku.virtualPayItemId;

    this.assertProductIdMatchesVirtualPayItem(nextProductId, nextVirtualPayItemId);
    if (body.productId) {
      await this.assertProductIdUnique(body.productId, id);
    }

    Object.assign(sku, {
      ...(body.productId !== undefined ? { productId: body.productId } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.price !== undefined ? { price: body.price.toFixed(2) } : {}),
      ...(body.linePrice !== undefined
        ? { linePrice: body.linePrice == null ? null : body.linePrice.toFixed(2) }
        : {}),
      ...(body.durationDays !== undefined ? { durationDays: body.durationDays } : {}),
      ...(body.virtualPayItemId !== undefined
        ? { virtualPayItemId: body.virtualPayItemId }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });

    const saved = await this.skuRepository.save(sku);
    return Result.success(saved, '更新成功');
  }

  /**
   * 切换上下架。
   *
   * @param id 主键
   * @param body 状态参数
   */
  async updateStatus(id: number, body: UpdateSkuStatusDto) {
    const sku = await this.findSkuOrFail(id);
    sku.status = body.status;
    const saved = await this.skuRepository.save(sku);
    return Result.success(saved, body.status === Status.SkuShelfStatus.On ? '已上架' : '已下架');
  }

  /**
   * 软删除商品 SKU。
   *
   * @param id 主键
   */
  async remove(id: number) {
    const sku = await this.findSkuOrFail(id);
    await this.skuRepository.softRemove(sku);
    return Result.success(null, '删除成功');
  }
}

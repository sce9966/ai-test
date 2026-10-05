import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { Status } from '../../common/interfaces/status';
import { attachAuditorNames, WithAuditorNames } from '../../common/utils/attachAuditorNames';
import { createUniqueUid } from '../../common/utils/createRandomUid';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import {
  CreateVirtualGoodsDto,
  QueryVirtualGoodsDto,
  UpdateVirtualGoodsDto,
} from './dto/virtual-goods.dto';

/**
 * 虚拟商品服务：会员与课程共用。
 */
@Injectable()
export class VirtualGoodsService {
  constructor(
    @InjectRepository(VirtualGoods)
    private readonly goodsRepository: Repository<VirtualGoods>,
    @InjectRepository(GiftCode)
    private readonly giftCodeRepository: Repository<GiftCode>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 生成不重复的 20 位商品 ID。
   */
  private async generateGoodsId(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const goodsId = createUniqueUid(20);
      const exists = await this.goodsRepository.exists({ where: { goodsId } });
      if (!exists) {
        return goodsId;
      }
    }
    throw new HttpException('生成商品ID失败，请重试', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * 新增虚拟商品。
   *
   * @param dto 创建参数
   * @param userId 操作人
   */
  async create(dto: CreateVirtualGoodsDto, userId: number): Promise<VirtualGoods> {
    const goods = this.goodsRepository.create({
      goodsId: await this.generateGoodsId(),
      kind: dto.kind,
      name: dto.name,
      price: dto.price.toFixed(2),
      linePrice: dto.linePrice.toFixed(2),
      remark: dto.remark,
      coverUrls: dto.coverUrls,
      durationDays: dto.durationDays,
      status: dto.status ?? Status.GoodsShelfStatus.On,
      subtitle: dto.subtitle ?? null,
      sort: dto.sort ?? 0,
      groupName: dto.groupName ?? null,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.goodsRepository.save(goods);
  }

  /**
   * 分页查询虚拟商品。
   *
   * @param query 筛选条件
   */
  async findAll(
    query: QueryVirtualGoodsDto,
  ): Promise<PaginatedResult<WithAuditorNames<VirtualGoods>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown> = {};
    if (query.kind) {
      where.kind = query.kind;
    }
    if (query.goodsId) {
      where.goodsId = query.goodsId;
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }
    if (query.name) {
      where.name = Like(`%${query.name}%`);
    }

    const [rows, total] = await this.goodsRepository.findAndCount({
      where,
      order: { sort: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      rows: await attachAuditorNames(this.userRepository, rows),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 按主键查询详情。
   *
   * @param id 主键
   */
  async findOne(id: number): Promise<WithAuditorNames<VirtualGoods>> {
    const goods = await this.goodsRepository.findOne({ where: { id } });
    if (!goods) {
      throw new HttpException('商品不存在', HttpStatus.NOT_FOUND);
    }
    const [row] = await attachAuditorNames(this.userRepository, [goods]);
    return row;
  }

  /**
   * 更新虚拟商品。
   *
   * @param id 主键
   * @param dto 更新参数
   * @param userId 操作人
   */
  async update(id: number, dto: UpdateVirtualGoodsDto, userId: number): Promise<VirtualGoods> {
    const goods = await this.goodsRepository.findOne({ where: { id } });
    if (!goods) {
      throw new HttpException('商品不存在', HttpStatus.NOT_FOUND);
    }

    if (dto.name !== undefined) {
      goods.name = dto.name;
    }
    if (dto.price !== undefined) {
      goods.price = dto.price.toFixed(2);
    }
    if (dto.linePrice !== undefined) {
      goods.linePrice = dto.linePrice.toFixed(2);
    }
    if (dto.remark !== undefined) {
      goods.remark = dto.remark;
    }
    if (dto.coverUrls !== undefined) {
      goods.coverUrls = dto.coverUrls;
    }
    if (dto.durationDays !== undefined) {
      goods.durationDays = dto.durationDays;
    }
    if (dto.status !== undefined) {
      goods.status = dto.status;
    }
    if (dto.subtitle !== undefined) {
      goods.subtitle = dto.subtitle;
    }
    if (dto.sort !== undefined) {
      goods.sort = dto.sort;
    }
    if (dto.groupName !== undefined) {
      goods.groupName = dto.groupName;
    }
    goods.updatedBy = userId;
    return this.goodsRepository.save(goods);
  }

  /**
   * 软删除虚拟商品。
   *
   * @param id 主键
   */
  async remove(id: number): Promise<void> {
    const goods = await this.goodsRepository.findOne({ where: { id } });
    if (!goods) {
      throw new HttpException('商品不存在', HttpStatus.NOT_FOUND);
    }

    const activeCodeCount = await this.giftCodeRepository.count({
      where: {
        goodsId: goods.goodsId,
        status: Not(Status.GiftCodeStatus.Voided),
      },
    });
    if (activeCodeCount > 0) {
      throw new HttpException('存在未作废兑换码，无法删除', HttpStatus.BAD_REQUEST);
    }

    const openOrderCount = await this.orderRepository.count({
      where: {
        goodsId: goods.goodsId,
        orderStatus: Status.OrderStatus.Normal,
      },
    });
    if (openOrderCount > 0) {
      throw new HttpException('存在未完结订单，无法删除', HttpStatus.BAD_REQUEST);
    }

    await this.goodsRepository.softRemove(goods);
  }
}

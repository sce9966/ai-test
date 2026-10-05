import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { attachAuditorNames, WithAuditorNames } from '../../common/utils/attachAuditorNames';
import { Order } from '../entity/order/order.entity';
import { User } from '../entity/user/user.entity';
import { QueryOrderDto } from './dto/order.dto';

/**
 * 订单查询服务（后台只读）。
 */
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 分页查询订单。
   *
   * @param query 筛选条件
   */
  async findAll(query: QueryOrderDto): Promise<PaginatedResult<WithAuditorNames<Order>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown> = {};
    if (query.orderNo) {
      where.orderNo = Like(`%${query.orderNo}%`);
    }
    if (query.goodsName) {
      where.goodsName = Like(`%${query.goodsName}%`);
    }
    if (query.userName) {
      where.userName = Like(`%${query.userName}%`);
    }
    if (query.payStatus !== undefined) {
      where.payStatus = query.payStatus;
    }
    if (query.orderStatus !== undefined) {
      where.orderStatus = query.orderStatus;
    }

    const [rows, total] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
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
   * 按主键查询订单。
   *
   * @param id 主键
   */
  async findOne(id: number): Promise<WithAuditorNames<Order>> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    const [row] = await attachAuditorNames(this.userRepository, [order]);
    return row;
  }

  /**
   * 按付款单号查询订单。
   *
   * @param orderNo 付款单号
   */
  async findByOrderNo(orderNo: string): Promise<WithAuditorNames<Order>> {
    const order = await this.orderRepository.findOne({ where: { orderNo } });
    if (!order) {
      throw new HttpException('订单不存在', HttpStatus.NOT_FOUND);
    }
    const [row] = await attachAuditorNames(this.userRepository, [order]);
    return row;
  }
}

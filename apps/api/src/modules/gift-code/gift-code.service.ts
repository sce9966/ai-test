import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { Status } from '../../common/interfaces/status';
import { attachAuditorNames, WithAuditorNames } from '../../common/utils/attachAuditorNames';
import { GiftCode } from '../entity/gift-code/gift-code.entity';
import { User } from '../entity/user/user.entity';
import { VirtualGoods } from '../entity/virtual-goods/virtual-goods.entity';
import { ImportGiftCodeDto, QueryGiftCodeDto } from './dto/gift-code.dto';

/**
 * 兑换码列表行（含商品名称）。
 */
export type GiftCodeListItem = WithAuditorNames<GiftCode> & {
  goodsName?: string | null;
};

/**
 * 兑换码导入结果。
 */
export interface GiftCodeImportResult {
  successCount: number;
  failed: Array<{ code: string; reason: string }>;
}

/**
 * 兑换码服务。
 */
@Injectable()
export class GiftCodeService {
  constructor(
    @InjectRepository(GiftCode)
    private readonly giftCodeRepository: Repository<GiftCode>,
    @InjectRepository(VirtualGoods)
    private readonly goodsRepository: Repository<VirtualGoods>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 清洗导入的兑换码。
   *
   * @param codes 原始列表
   */
  private normalizeCodes(codes: string[]): string[] {
    return codes.map((code) => code.trim()).filter((code) => code.length > 0);
  }

  /**
   * 批量导入兑换码。
   *
   * @param dto 导入参数
   * @param userId 操作人
   */
  async import(dto: ImportGiftCodeDto, userId: number): Promise<GiftCodeImportResult> {
    const goods = await this.goodsRepository.findOne({ where: { goodsId: dto.goodsId } });
    if (!goods) {
      throw new HttpException('商品不存在', HttpStatus.NOT_FOUND);
    }

    const failed: GiftCodeImportResult['failed'] = [];
    const seen = new Set<string>();
    const uniqueCodes: string[] = [];

    for (const raw of this.normalizeCodes(dto.codes)) {
      if (raw.length > 64) {
        failed.push({ code: raw, reason: '长度超过64' });
        continue;
      }
      if (seen.has(raw)) {
        failed.push({ code: raw, reason: '本次导入重复' });
        continue;
      }
      seen.add(raw);
      uniqueCodes.push(raw);
    }

    if (uniqueCodes.length === 0) {
      return { successCount: 0, failed };
    }

    const existing = await this.giftCodeRepository.find({
      where: { code: In(uniqueCodes) },
      select: ['code'],
    });
    const existingSet = new Set(existing.map((item) => item.code));
    const toInsert: string[] = [];
    for (const code of uniqueCodes) {
      if (existingSet.has(code)) {
        failed.push({ code, reason: '库中已存在' });
      } else {
        toInsert.push(code);
      }
    }

    if (toInsert.length > 0) {
      const entities = toInsert.map((code) =>
        this.giftCodeRepository.create({
          code,
          goodsId: dto.goodsId,
          status: Status.GiftCodeStatus.Unused,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
      await this.giftCodeRepository.save(entities);
    }

    return { successCount: toInsert.length, failed };
  }

  /**
   * 分页查询兑换码。
   *
   * @param query 筛选条件
   */
  async findAll(query: QueryGiftCodeDto): Promise<PaginatedResult<GiftCodeListItem>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const qb = this.giftCodeRepository
      .createQueryBuilder('gift')
      .leftJoin(VirtualGoods, 'goods', 'goods.goodsId = gift.goodsId AND goods.deletedAt IS NULL');

    if (query.code) {
      qb.andWhere('gift.code LIKE :code', { code: `%${query.code}%` });
    }
    if (query.goodsId) {
      qb.andWhere('gift.goodsId = :goodsId', { goodsId: query.goodsId });
    }
    if (query.orderNo) {
      qb.andWhere('gift.orderNo = :orderNo', { orderNo: query.orderNo });
    }
    if (query.status !== undefined) {
      qb.andWhere('gift.status = :status', { status: query.status });
    }
    if (query.goodsName) {
      qb.andWhere('goods.name LIKE :goodsName', { goodsName: `%${query.goodsName}%` });
    }

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .clone()
      .addSelect('goods.name', 'goodsName')
      .orderBy('gift.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawAndEntities();
    const withNames = await attachAuditorNames(this.userRepository, entities);
    const rows = withNames.map((row, index) => {
      const rawRow = (raw[index] ?? {}) as Record<string, unknown>;
      const goodsName =
        (rawRow.goodsName as string | undefined) ??
        (Object.entries(rawRow).find(([key]) => key.toLowerCase().endsWith('goodsname'))?.[1] as
          | string
          | undefined) ??
        null;
      return { ...row, goodsName };
    });

    return { rows, total, page, pageSize };
  }

  /**
   * 查询兑换码详情。
   *
   * @param id 主键
   */
  async findOne(id: number): Promise<GiftCodeListItem> {
    const gift = await this.giftCodeRepository.findOne({ where: { id } });
    if (!gift) {
      throw new HttpException('兑换码不存在', HttpStatus.NOT_FOUND);
    }
    const goods = await this.goodsRepository.findOne({ where: { goodsId: gift.goodsId } });
    const [row] = await attachAuditorNames(this.userRepository, [gift]);
    return { ...row, goodsName: goods?.name ?? null };
  }

  /**
   * 作废兑换码。已绑定订单时仍标记作废，不再核销。
   *
   * @param id 主键
   * @param userId 操作人
   */
  async void(id: number, userId: number): Promise<GiftCode> {
    const gift = await this.giftCodeRepository.findOne({ where: { id } });
    if (!gift) {
      throw new HttpException('兑换码不存在', HttpStatus.NOT_FOUND);
    }
    if (gift.status === Status.GiftCodeStatus.Voided) {
      throw new HttpException('兑换码已作废', HttpStatus.BAD_REQUEST);
    }
    gift.status = Status.GiftCodeStatus.Voided;
    gift.updatedBy = userId;
    return this.giftCodeRepository.save(gift);
  }
}

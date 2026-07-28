import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserStatus } from './entities/user.entity';

/**
 * 用户领域服务：按租户隔离查询与写入。
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * 在指定租户下按用户名查找用户。
   *
   * @param tenantId 租户 ID
   * @param username 登录用户名
   * @returns 用户实体或 null
   */
  async findByUsername(tenantId: string, username: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { tenantId, username },
    });
  }

  /**
   * 在指定租户下按 ID 查找用户；跨租户或不存在时抛出 404。
   *
   * @param tenantId 租户 ID（来自鉴权上下文）
   * @param userId 用户 ID
   * @returns 用户实体
   * @throws NotFoundException 用户不存在或不属于当前租户
   */
  async findByIdInTenant(tenantId: string, userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, tenantId },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 创建用户（密码须已哈希）。
   *
   * @param input 创建参数
   * @returns 新建用户
   */
  async create(input: {
    tenantId: string;
    username: string;
    displayName: string;
    passwordHash: string;
    status?: UserStatus;
  }): Promise<UserEntity> {
    const entity = this.usersRepository.create({
      tenantId: input.tenantId,
      username: input.username,
      displayName: input.displayName,
      passwordHash: input.passwordHash,
      status: input.status ?? UserStatus.Active,
    });
    return this.usersRepository.save(entity);
  }

  /**
   * 统计指定租户下的用户数量（用于演示账号幂等种子）。
   *
   * @param tenantId 租户 ID
   * @returns 用户数
   */
  async countByTenant(tenantId: string): Promise<number> {
    return this.usersRepository.count({ where: { tenantId } });
  }
}

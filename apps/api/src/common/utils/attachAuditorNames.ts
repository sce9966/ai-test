import { In, Repository } from 'typeorm';
import { User } from '../../modules/entity/user/user.entity';

/**
 * 带审计人姓名的列表行。
 */
export type WithAuditorNames<T> = T & {
  createdByName?: string | null;
  updatedByName?: string | null;
};

/**
 * 批量为实体填充创建人 / 更新人用户名。
 *
 * @param userRepository 用户仓储
 * @param rows 带 createdBy / updatedBy 的记录
 */
export async function attachAuditorNames<T extends { createdBy?: number | null; updatedBy?: number | null }>(
  userRepository: Repository<User>,
  rows: T[],
): Promise<WithAuditorNames<T>[]> {
  const ids = new Set<number>();
  for (const row of rows) {
    if (row.createdBy) {
      ids.add(row.createdBy);
    }
    if (row.updatedBy) {
      ids.add(row.updatedBy);
    }
  }
  if (ids.size === 0) {
    return rows.map((row) => ({
      ...row,
      createdByName: null,
      updatedByName: null,
    }));
  }

  const users = await userRepository.find({
    where: { id: In([...ids]) },
    select: ['id', 'username'],
  });
  const nameMap = new Map(users.map((user) => [user.id, user.username]));

  return rows.map((row) => ({
    ...row,
    createdByName: row.createdBy ? (nameMap.get(row.createdBy) ?? null) : null,
    updatedByName: row.updatedBy ? (nameMap.get(row.updatedBy) ?? null) : null,
  }));
}

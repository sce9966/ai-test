import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * 创建 `users` 表（含 `tenant_id` 行级多租户索引）。
 */
export class CreateUsersTable1753700000000 implements MigrationInterface {
  name = 'CreateUsersTable1753700000000';

  /**
   * 执行迁移。
   *
   * @param queryRunner TypeORM QueryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'tenant_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '32',
            isNullable: false,
            default: `'active'`,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'uk_users_tenant_username',
        columnNames: ['tenant_id', 'username'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
  }

  /**
   * 回滚迁移。
   *
   * @param queryRunner TypeORM QueryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}

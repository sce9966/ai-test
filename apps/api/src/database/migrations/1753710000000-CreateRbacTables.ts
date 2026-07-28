import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * 创建 RBAC 相关表：permissions / roles / menus 及关联表。
 */
export class CreateRbacTables1753710000000 implements MigrationInterface {
  name = 'CreateRbacTables1753710000000';

  /**
   * 执行迁移。
   *
   * @param queryRunner TypeORM QueryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'code', type: 'varchar', length: '128', isNullable: false },
          { name: 'name', type: 'varchar', length: '128', isNullable: false },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
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
      'permissions',
      new TableIndex({
        name: 'uk_permissions_code',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'tenant_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'code', type: 'varchar', length: '64', isNullable: false },
          { name: 'name', type: 'varchar', length: '128', isNullable: false },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
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
      'roles',
      new TableIndex({
        name: 'uk_roles_tenant_code',
        columnNames: ['tenant_id', 'code'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'menus',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'tenant_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'parent_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'name', type: 'varchar', length: '128', isNullable: false },
          { name: 'path', type: 'varchar', length: '255', isNullable: true },
          { name: 'component', type: 'varchar', length: '255', isNullable: true },
          { name: 'icon', type: 'varchar', length: '64', isNullable: true },
          { name: 'permission_code', type: 'varchar', length: '128', isNullable: true },
          {
            name: 'sort_order',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '32',
            isNullable: false,
            default: `'menu'`,
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
      'menus',
      new TableIndex({
        name: 'idx_menus_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'menus',
      new TableIndex({
        name: 'idx_menus_tenant_parent',
        columnNames: ['tenant_id', 'parent_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'tenant_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'user_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'role_id', type: 'varchar', length: '36', isNullable: false },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'uk_user_roles_tenant_user_role',
        columnNames: ['tenant_id', 'user_id', 'role_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_tenant_user',
        columnNames: ['tenant_id', 'user_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'tenant_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'role_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'permission_id', type: 'varchar', length: '36', isNullable: false },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'uk_role_permissions_tenant_role_perm',
        columnNames: ['tenant_id', 'role_id', 'permission_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'idx_role_permissions_tenant_role',
        columnNames: ['tenant_id', 'role_id'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'role_menus',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'tenant_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'role_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'menu_id', type: 'varchar', length: '36', isNullable: false },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'role_menus',
      new TableIndex({
        name: 'uk_role_menus_tenant_role_menu',
        columnNames: ['tenant_id', 'role_id', 'menu_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'role_menus',
      new TableIndex({
        name: 'idx_role_menus_tenant_role',
        columnNames: ['tenant_id', 'role_id'],
      }),
    );
  }

  /**
   * 回滚迁移。
   *
   * @param queryRunner TypeORM QueryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_menus');
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropTable('menus');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}

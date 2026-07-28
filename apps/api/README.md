# apps/api

后端应用（**NestJS + TypeORM + MySQL + Redis**）。

包名：`@admin-template/api`

## 前置依赖

本仓库**不**通过 docker-compose 拉起 MySQL / Redis。请先准备好已有实例，并在 `.env` 中填写连接信息（可复制 `.env.example`）。

## 本地启动

在 **仓库根目录**：

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# 编辑 apps/api/.env，指向已有 MySQL / Redis，并设置 JWT_SECRET
pnpm dev:api
```

默认监听 `http://localhost:3000`。

| 路径 | 说明 | 鉴权 |
|------|------|------|
| `GET /` | 基线探活文案 | 公开 |
| `GET /health/live` | 进程存活 | 公开 |
| `GET /health` | MySQL + Redis 健康检查 | 公开 |
| `POST /auth/login` | 登录，返回 Access Token | 公开 |
| `GET /auth/me` | 当前用户 | Bearer JWT |
| `POST /auth/logout` | 登出（Token 写入 Redis 黑名单） | Bearer JWT |

### 登录示例

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'
```

响应字段：`accessToken`、`tokenType`、`expiresIn`、`user`。

可选 body 字段 `tenantId`（缺省为 `AUTH_DEFAULT_TENANT_ID`，默认 `default`）。租户上下文以服务端用户记录为准，JWT 载荷携带 `tenantId`，后续接口不得信任客户端随意传入的租户。

### 演示账号

当 `AUTH_SEED_DEMO_USER=true` 时，启动会幂等写入演示管理员（密码见 `.env.example`，**勿用于生产**）。

开发可设 `DB_SYNCHRONIZE=true` 自动建表；生产必须 `false`，并执行：

```bash
pnpm --filter @admin-template/api migration:run
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` / `NODE_ENV` | HTTP 端口与运行环境 |
| `DB_*` | MySQL 连接（TypeORM） |
| `DB_SYNCHRONIZE` | 仅 development 可 `true`；生产必须 `false` |
| `REDIS_*` | Redis 连接（ioredis；登出黑名单） |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | JWT 密钥与过期时间 |
| `AUTH_DEFAULT_TENANT_ID` | 登录默认租户 |
| `AUTH_SEED_DEMO_USER` | 是否写入演示账号 |
| `AUTH_DEMO_USERNAME` / `AUTH_DEMO_PASSWORD` | 演示账号凭据 |

**勿**将真实密钥写入仓库；`.env` 已由根 `.gitignore` 忽略。

## Redis 黑名单

- Key：`auth:blacklist:{jti}`
- Value：`1`
- TTL：Token 剩余有效秒数（与 `exp` 对齐）
- 登出后携带同一 Token 访问受保护接口将返回 401

## 前端联调契约（最小）

1. `POST /auth/login` → 将 `accessToken` 存本地（如 `localStorage`）
2. 请求头：`Authorization: Bearer <accessToken>`
3. 进入布局前可调用 `GET /auth/me`
4. HTTP 拦截器遇 **401** 清除 Token 并跳转登录页
5. 登出调用 `POST /auth/logout` 后再清本地 Token

## ORM 约定

- **写死 TypeORM**（非 Prisma）
- `users` 表含可索引 `tenant_id`；查询一律带租户条件
- Migration：`src/database/migrations/1753700000000-CreateUsersTable.ts`

## 规范与脚本

| 命令 | 说明 |
|------|------|
| `pnpm lint` / `pnpm test` / `pnpm build` | 规范 / 单测 / 构建 |
| `pnpm migration:run` | 执行 Migration |

## 边界

- **本 Issue（AIL-8）**：登录 / 当前用户 / 登出（JWT + Redis 黑名单）
- **非目标**：完整 RBAC 管理页、动态菜单（见 AIL-9 / AIL-10）

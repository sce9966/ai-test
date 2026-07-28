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
# 编辑 apps/api/.env，指向已有 MySQL / Redis
pnpm dev:api
```

在 **本目录**：

```bash
cp .env.example .env
pnpm dev
```

默认监听 `http://localhost:3000`。

| 路径 | 说明 |
|------|------|
| `GET /` | 基线探活文案 |
| `GET /health/live` | 进程存活（不依赖外部） |
| `GET /health` | 综合健康检查（MySQL + Redis） |

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改，**指向已有 MySQL / Redis**：

| 变量 | 说明 |
|------|------|
| `PORT` / `NODE_ENV` | HTTP 端口与运行环境 |
| `DB_*` | MySQL 连接（TypeORM） |
| `DB_SYNCHRONIZE` | 仅 development 可 `true`；生产必须 `false` 并走 Migration |
| `REDIS_*` | Redis 连接（ioredis） |

**勿**将真实密钥写入仓库；`.env` 已由根 `.gitignore` 忽略。

## ORM 约定

- **写死 TypeORM**（非 Prisma）
- 本阶段无业务 Entity；`autoLoadEntities: true`，`synchronize` 默认关闭
- 后续鉴权 / RBAC Entity 通过 Migration 落地

## 规范与脚本

| 命令 | 说明 |
|------|------|
| `pnpm lint` / `pnpm lint:check` | ESLint（flat config + Prettier） |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm build` | `nest build` → `dist/` |
| `pnpm test` | 单元测试（Jest） |

根目录亦可：`pnpm lint:api`、`pnpm build:api`。

## 目录结构

```text
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/          # app / database / redis 配置与 env 校验
│   ├── database/        # TypeORM MySQL 接线
│   ├── redis/           # ioredis 客户端与 RedisService
│   └── health/          # Terminus 健康检查
├── .env.example
└── package.json
```

## 边界

- **本 Issue**：可启动 Nest、TypeORM 经 `.env` 连 MySQL、Redis ping、健康检查
- **非目标**：本仓库 docker-compose 拉起依赖、登录鉴权、业务 CRUD、Seed 数据

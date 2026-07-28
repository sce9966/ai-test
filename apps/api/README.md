# apps/api

后端应用（**NestJS + TypeScript**）。ORM 约定为 **TypeORM**（真实连库 / Redis / 健康检查见后续基础设施 Issue，本目录仅预留配置位）。

包名：`@admin-template/api`

## 本地启动

在 **仓库根目录**：

```bash
pnpm install
pnpm dev:api
# 或
pnpm --filter @admin-template/api start:dev
```

在 **本目录**：

```bash
pnpm install   # 若仅在本包安装（仍建议根目录 workspace 安装）
cp .env.example .env
pnpm dev
```

默认监听 `http://localhost:3000`，`GET /` 返回基线探活 JSON。

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改。示例中含：

| 变量 | 说明 |
|------|------|
| `PORT` / `NODE_ENV` | HTTP 端口与运行环境 |
| `DB_*` | MySQL 占位（本阶段不连接） |
| `REDIS_*` | Redis 占位（本阶段不连接） |

**勿**将真实密钥写入仓库；`.env` 已由根 `.gitignore` 忽略。

## 规范与脚本

| 命令 | 说明 |
|------|------|
| `pnpm lint` / `pnpm lint:check` | ESLint（flat config + Prettier） |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm build` | `nest build` → `dist/` |
| `pnpm test` | 单元测试（Jest） |

根目录亦可：`pnpm lint:api`、`pnpm build:api`。

## 目录结构（基线）

```text
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── config/          # app / database / redis 配置命名空间
├── .env.example
├── eslint.config.mjs
├── .prettierrc
├── nest-cli.json
└── package.json
```

## 边界

- **本基线**：可启动 Nest 工程、规范与环境样例、配置占位
- **非目标**：docker-compose、健康检查接口、TypeORM 实连、鉴权与业务 API（留给后续基础设施 / 业务 Issue）

# 企业级中后台管理模板

内部可复用脚手架（monorepo）。本仓库采用 **pnpm workspace**，约定前后端分应用目录。

## 仓库结构

```text
.
├── apps/
│   ├── web/          # 前端（Vue + Vite + shadcn-vue + Tailwind）
│   └── api/          # 后端（NestJS + TypeORM + MySQL + Redis）
├── package.json      # 根脚本入口（dev:web / dev:api 等）
├── pnpm-workspace.yaml
└── README.md
```

## 环境要求

- Node.js >= 20（前端脚手架推荐 Node 22+）
- 包管理器固定 **pnpm**（根 `package.json` 已声明 `packageManager`）

启用 Corepack（推荐）：

```bash
corepack enable
```

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

## 分别启动前后端

```bash
# 前端开发服务（apps/web）
pnpm dev:web

# 后端开发服务（apps/api，NestJS）
pnpm dev:api
```

等价于对对应 workspace 包执行 `pnpm --filter <pkg> dev`。

构建 / 规范：

```bash
pnpm build:web
pnpm build:api
pnpm lint:web
pnpm lint:api
pnpm --filter @admin-template/web type-check
```

### 后端（apps/api）快速说明

1. 复制环境样例：`cp apps/api/.env.example apps/api/.env`（按需改端口；DB/Redis 为本阶段占位，**不必**真实可达）
2. 根目录执行 `pnpm dev:api`，默认 `http://localhost:3000`，`GET /` 返回探活 JSON
3. 详细说明见 `apps/api/README.md`

ORM 约定为 **TypeORM**；docker-compose、实连与健康检查由后续基础设施 Issue（相对布局壳 / 鉴权等功能 Issue）落地，本 README 仅描述仓库安装与启动入口。

## 前端环境变量

见 `apps/web/.env.example` 与 `apps/web/README.md`。本地复制为 `apps/web/.env` 使用，**勿提交真实密钥 / Token**。

| 变量 | 含义 |
|------|------|
| `VITE_APP_TITLE` | 浏览器标题前缀 |
| `VITE_API_BASE_URL` | 后端 API 基址 |
| `VITE_API_TIMEOUT_MS` | 请求超时（毫秒） |
| `VITE_API_TOKEN` | 鉴权 Token 占位（仅本地调试） |

## 相关约定

| 区域 | 目标栈 | 状态 |
|------|--------|------|
| `apps/web` | Vue 3 + Vite + TypeScript + shadcn-vue + Tailwind | 工程基线 + 主题系统（白 / 浅蓝）已落地 |
| `apps/api` | NestJS + TypeORM + MySQL + Redis | 工程基线已落地（可启动；未实连 DB/Redis） |

主题约定与「如何新增第三套主题」见 `apps/web/docs/themes.md`。完整布局壳、鉴权等由对应功能 Issue 负责。

## 安全

- 勿将真实密钥、token、`.env` 提交入库
- 各应用提供 `.env.example`，本地复制为 `.env` 使用

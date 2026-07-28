# 企业级中后台管理模板

内部可复用脚手架（monorepo）。本仓库采用 **pnpm workspace**，约定前后端分应用目录。

## 仓库结构

```text
.
├── apps/
│   ├── web/          # 前端（Vue + Vite + shadcn-vue + Tailwind）
│   └── api/          # 后端（NestJS + TypeORM + MySQL + Redis）
├── docker-compose.yml # 本地 MySQL + Redis
├── package.json      # 根脚本入口（dev:web / dev:api / docker:*）
├── pnpm-workspace.yaml
└── README.md
```

## 环境要求

- Node.js >= 20（前端脚手架推荐 Node 22+）
- 包管理器固定 **pnpm**（根 `package.json` 已声明 `packageManager`）
- Docker / Docker Compose（本地 MySQL、Redis）

启用 Corepack（推荐）：

```bash
corepack enable
```

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

## 本地基础设施（MySQL + Redis）

```bash
pnpm docker:up
# 查看状态：pnpm docker:ps
# 停止：pnpm docker:down
```

默认账号与 `apps/api/.env.example` 对齐：MySQL `root` / `change_me`，库名 `admin_template`，主机端口 **3307**（容器内仍为 3306，避免与本机 MySQL 冲突）；Redis 无密码、端口 `6379`。

## 分别启动前后端

```bash
# 前端开发服务（apps/web）
pnpm dev:web

# 后端开发服务（apps/api，NestJS）
cp apps/api/.env.example apps/api/.env
pnpm docker:up
pnpm dev:api
```

后端健康检查：

- `GET http://localhost:3000/health/live` — 进程存活
- `GET http://localhost:3000/health` — MySQL + Redis

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

1. 复制环境样例：`cp apps/api/.env.example apps/api/.env`
2. 根目录执行 `pnpm docker:up`，再 `pnpm dev:api`，默认 `http://localhost:3000`
3. 详细说明见 `apps/api/README.md`

ORM 约定：**TypeORM**（已接线 MySQL）；Redis 使用 **ioredis**。

## 前端环境变量

见 `apps/web/.env.example` 与 `apps/web/README.md`。本地复制为 `apps/web/.env` 使用。**勿提交真实密钥 / Token**。

| 变量 | 含义 |
|------|------|
| `VITE_APP_TITLE` | 浏览器标题前缀 |
| `VITE_API_BASE_URL` | 后端 API 基址 |
| `VITE_API_TIMEOUT_MS` | 请求超时（毫秒） |
| `VITE_API_TOKEN` | 鉴权 Token 占位（仅本地调试） |

## 相关约定

| 区域 | 目标栈 | 状态 |
|------|--------|------|
| `apps/web` | Vue 3 + Vite + TypeScript + shadcn-vue + Tailwind | 工程基线已落地 |
| `apps/api` | NestJS + TypeORM + MySQL + Redis | 可启动；已接入 DB/Redis 与健康检查 |
| `docker-compose.yml` | MySQL 8 + Redis | 本地依赖（主机 MySQL 端口 3307） |

布局壳、鉴权、主题等能力由对应功能 Issue 负责。

## 安全

- 勿将真实密钥、token、`.env` 提交入库
- 各应用提供 `.env.example`，本地复制为 `.env` 使用

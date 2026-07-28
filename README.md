# 企业级中后台管理模板

内部可复用脚手架（monorepo）。本仓库采用 **pnpm workspace**，约定前后端分应用目录。

## 仓库结构

```text
.
├── apps/
│   ├── web/          # 前端（Vue + Vite + shadcn-vue + Tailwind）
│   └── api/          # 后端（NestJS + MySQL + Redis）
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

# 后端开发服务（apps/api；脚手架落地后可用）
pnpm dev:api
```

等价于对对应 workspace 包执行 `pnpm --filter <pkg> dev`。

构建 / 规范：

```bash
pnpm build:web
pnpm lint:web
pnpm --filter @admin-template/web type-check
```

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
| `apps/web` | Vue 3 + Vite + TypeScript + shadcn-vue + Tailwind | 工程基线已落地 |
| `apps/api` | NestJS + TypeORM + MySQL + Redis | 占位或由后端基线 Issue 落地 |

布局壳、鉴权、主题等能力由对应功能 Issue 负责，本 README 仅描述仓库安装与启动入口。

## 安全

- 勿将真实密钥、token、`.env` 提交入库
- 各应用提供 `.env.example`，本地复制为 `.env` 使用

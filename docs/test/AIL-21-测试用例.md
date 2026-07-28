# AIL-21 测试用例：monorepo 工程基线验收（对照 AIL-4）

| 项 | 内容 |
|----|------|
| Issue | AIL-21 / 对照 AIL-4 |
| 范围 | 根 README、目录约定、前后端规范与 TypeScript 基线、`.env.example`、进程级启动冒烟 |
| 非目标 | 业务功能、鉴权、docker-compose 实连、布局壳（AIL-5 / AIL-6） |
| 环境 | Node.js >= 20，pnpm（`packageManager`），Windows / 本地 workdir |

## 测试范围矩阵

| 维度 | 覆盖点 | 用例 ID |
|------|--------|---------|
| 前端完整性 | `apps/web` 目录、启动脚本、ESLint/Oxlint/Prettier、`vue-tsc`、`.env.example` | TC-WEB-01 ~ TC-WEB-05 |
| 后端 API/服务 | `apps/api` 目录、启动/lint 脚本可执行、Nest 模块结构、规范配置、`.env.example` | TC-API-01 ~ TC-API-05 |
| 业务/工程规则 | 根 README 安装启动说明、仓库结构与 Stage 边界、无密钥入库 | TC-ROOT-01 ~ TC-ROOT-04 |

---

## 用例列表

### TC-ROOT-01 根 workspace 与 apps 目录约定

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-ROOT-01 |
| 模块 | 根工程 / 目录约定 |
| 前置条件 | 仓库已 checkout |
| 步骤 | 1. 检查存在 `pnpm-workspace.yaml` 且覆盖 `apps/*`<br>2. 检查存在 `apps/web`、`apps/api`<br>3. 根 `package.json` 含 `dev:web` / `dev:api` |
| 期望结果 | 目录与脚本入口齐全 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | `tests/baseline/ail21-acceptance.test.mjs` → `TC-ROOT-01` |

### TC-ROOT-02 根 README 安装与分别启动说明

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-ROOT-02 |
| 模块 | 根 README |
| 前置条件 | 存在根 `README.md` |
| 步骤 | 1. 阅读 README<br>2. 核对含 `pnpm install`<br>3. 核对含 `pnpm dev:web` 与 `pnpm dev:api` |
| 期望结果 | 安装与前后端分别启动命令均有说明 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-ROOT-02` |

### TC-ROOT-03 README 仓库结构与 Stage 边界

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-ROOT-03 |
| 模块 | 根 README / 边界说明 |
| 前置条件 | 存在根 `README.md` |
| 步骤 | 1. 核对简述 `apps/web`、`apps/api` 结构<br>2. 核对说明布局壳 / 基础设施不在本基线重复造轮（相对 AIL-5 / AIL-6 或等价表述） |
| 期望结果 | 结构说明清晰；边界不与 AIL-5/AIL-6 抢活 |
| 优先级 | P1 |
| 类型 | 回归 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-ROOT-03` |

### TC-ROOT-04 无密钥入库（`.env.example` 抽查）

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-ROOT-04 |
| 模块 | 安全 / 环境样例 |
| 前置条件 | 存在 `apps/web/.env.example`、`apps/api/.env.example`；`.gitignore` 忽略 `.env` |
| 步骤 | 1. 读取两份 `.env.example`<br>2. 抽查无真实 JWT/Token/云厂商密钥形态<br>3. 确认密码类仅为占位（如 `change_me` / 空） |
| 期望结果 | 示例文件无真实密钥；`.env` 被 gitignore |
| 优先级 | P0 |
| 类型 | 安全 / 边界 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-ROOT-04` |

### TC-WEB-01 前端可按 README 拉起开发进程

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-WEB-01 |
| 模块 | apps/web 启动 |
| 前置条件 | 根目录已 `pnpm install` |
| 步骤 | 1. 执行 `pnpm dev:web`<br>2. 观察 Vite 输出出现 Local URL |
| 期望结果 | 开发进程可拉起（进程级；本用例不强依赖 HTTP 可达） |
| 优先级 | P0 |
| 类型 | 冒烟 |
| 自动化 | 手工 / 报告记录；静态侧：`TC-WEB-01-script` 校验脚本非占位 |

### TC-WEB-02 前端 ESLint / Oxlint 可执行

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-WEB-02 |
| 模块 | apps/web 规范 |
| 前置条件 | 已安装依赖 |
| 步骤 | 执行 `pnpm lint:web` |
| 期望结果 | 退出码 0 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | 手工执行记入报告；静态校验存在 eslint / oxlint 配置 |

### TC-WEB-03 前端 TypeScript 基线（vue-tsc）

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-WEB-03 |
| 模块 | apps/web TypeScript |
| 前置条件 | 已安装依赖 |
| 步骤 | 执行 `pnpm typecheck:web` |
| 期望结果 | 退出码 0 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | 手工执行记入报告 |

### TC-WEB-04 前端 Prettier 可用

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-WEB-04 |
| 模块 | apps/web 格式化 |
| 前置条件 | 已安装依赖；存在 `.prettierrc.json` |
| 步骤 | 执行 `pnpm --filter @admin-template/web exec prettier --check --experimental-cli src/` |
| 期望结果 | 配置存在且命令可运行；风格问题记为一般缺陷（不阻塞基线“规范已就绪”） |
| 优先级 | P1 |
| 类型 | 回归 |
| 自动化 | 静态：`TC-WEB-04`；手工 check 记入报告 |

### TC-WEB-05 前端 `.env.example` 变量齐全

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-WEB-05 |
| 模块 | apps/web 环境样例 |
| 前置条件 | 存在 `apps/web/.env.example` |
| 步骤 | 核对含 `VITE_APP_TITLE`、`VITE_API_BASE_URL`、`VITE_API_TIMEOUT_MS`、`VITE_API_TOKEN` |
| 期望结果 | 关键变量齐全；Token 为空或占位 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-WEB-05` |

### TC-API-01 后端可按 README 拉起开发进程

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-API-01 |
| 模块 | apps/api 启动 |
| 前置条件 | 根目录已 `pnpm install`；按 README 可复制 `.env.example` → `.env` |
| 步骤 | 执行 `pnpm dev:api` |
| 期望结果 | Nest 进程可拉起（至少进程级；DB/Redis 未接线可接受） |
| 优先级 | P0 |
| 类型 | 冒烟 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-API-01`（校验 `package.json` scripts / 依赖非占位） |

### TC-API-02 后端 ESLint / Prettier 可执行

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-API-02 |
| 模块 | apps/api 规范 |
| 前置条件 | 依赖已安装且 lint 脚本非占位 |
| 步骤 | 执行 `pnpm lint:api`；核对存在 eslint / prettier 配置 |
| 期望结果 | 配置存在且 lint 命令退出码 0 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | 静态配置 + 脚本非占位校验；手工执行记入报告 |

### TC-API-03 后端 TypeScript / Nest 模块结构

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-API-03 |
| 模块 | apps/api 结构 |
| 前置条件 | 仓库已 checkout |
| 步骤 | 检查存在 `src/main.ts`、`src/app.module.ts`、`nest-cli.json`、`tsconfig.json` |
| 期望结果 | Nest 默认模块骨架清晰 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-API-03` |

### TC-API-04 后端 `.env.example` 占位变量

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-API-04 |
| 模块 | apps/api 环境样例 |
| 前置条件 | 存在 `apps/api/.env.example` |
| 步骤 | 核对含 `PORT`、`DB_*`、`REDIS_*` 等占位 |
| 期望结果 | 变量齐全且无真实密钥 |
| 优先级 | P0 |
| 类型 | 功能 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-API-04` |

### TC-API-05 package.json 与源码一致性（合并完整性）

| 字段 | 内容 |
|------|------|
| 用例 ID | TC-API-05 |
| 模块 | apps/api 交付完整性 |
| 前置条件 | 存在 Nest 源码与 `package.json` |
| 步骤 | 1. 若存在 `src/main.ts` 引用 `@nestjs/core`<br>2. 则 `package.json` 应声明 `@nestjs/core` 等依赖，且 `dev`/`lint` 非 `process.exit(1)` 占位 |
| 期望结果 | 源码与可安装依赖、可执行脚本一致 |
| 优先级 | P0 |
| 类型 | 异常 / 回归 |
| 自动化 | `ail21-acceptance.test.mjs` → `TC-API-05` |

---

## 手工补充步骤（进程级）

```bash
# 根目录
pnpm install

# 前端
pnpm dev:web          # 期望 Vite ready
pnpm lint:web
pnpm typecheck:web
pnpm build:web

# 后端
cp apps/api/.env.example apps/api/.env   # Windows 可用 Copy-Item
pnpm dev:api
pnpm lint:api
pnpm build:api
```

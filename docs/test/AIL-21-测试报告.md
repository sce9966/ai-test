# AIL-21 测试报告：monorepo 工程基线验收（对照 AIL-4）

## 摘要

| 项 | 内容 |
|----|------|
| 范围 | 对照 AIL-4：`apps/web` / `apps/api`、根 README、ESLint/Prettier/TS、`.env.example`、进程级启动 |
| 环境 | Windows；Node v24.5.0；pnpm 11.5.2；仓库 `sce9966/ai-test` 分支 `agent/agent/87fac00a`（基于 `origin/master`） |
| 结论 | **不通过** |
| 是否建议将 AIL-4 标为完成 | **否**。前端基线可用；后端源码与配置文件已部分入库，但 `apps/api/package.json` 仍为 AIL-18 占位脚本，**无法按 README 安装依赖并启动 / lint**，不满足 AIL-4「前后端均可启动 + 规范可执行」 |

## 执行统计

| 结果 | 数量 | 说明 |
|------|------|------|
| 通过 | 10 | 目录约定、README 安装启动说明、前端规范/类型检查/构建/进程拉起、两侧 `.env.example`、Nest 骨架文件、api 规范配置文件 |
| 失败 | 3 | TC-API-01 启动、TC-API-02 lint 执行、TC-API-05 package 与源码一致性 |
| 阻塞 | 0 | — |
| 未测 | 1 | TC-WEB-01 的 HTTP 页面可达性（Vite 已 ready；本机 Invoke-WebRequest 连不上，按验收「进程级」记通过） |
| 一般问题 | 1 | 前端 Prettier `--check` 有 3 个文件风格告警（不阻塞「规范已配置」） |

自动化静态验收：`pnpm test:baseline` → **9 通过 / 1 失败**（失败即 TC-API-05）。

## 验收清单对照（AIL-4 / AIL-21）

| 验收项 | 结果 | 证据 |
|--------|------|------|
| 存在 `apps/web` 与 `apps/api` 且可按 README 启动 | **部分失败** | web：`pnpm dev:web` Vite ready；api：`pnpm dev:api` 立即 `process.exit(1)` 占位文案 |
| 根 README 说明分别安装与启动 | **通过** | 含 `pnpm install` / `dev:web` / `dev:api` |
| ESLint/Prettier（或等价）与 TS 前后端可执行 | **部分失败** | web：`lint:web` / `typecheck:web` 退出码 0；api：`lint:api` 占位失败；配置文件存在 |
| `.env.example` 已提供且无密钥 | **通过** | `apps/web`、`apps/api` 均有；Token/密码为占位或空 |
| README 简述结构与 Stage 边界 | **有条件通过** | 根 README 有结构与「布局壳由后续 Issue」；未显式写 AIL-5/AIL-6 编号，web README 有布局壳边界 |
| 结果回写并建议 AIL-4 是否完成 | 本报告 + Issue 评论 | **建议暂不关闭 AIL-4** |

## 自动化执行

```bash
pnpm install
pnpm test:baseline
```

| 项 | 值 |
|----|----|
| 命令 | `pnpm test:baseline`（`node --test tests/baseline/*.test.mjs`） |
| 退出码 | 1 |
| 摘要 | tests 10；pass 9；fail 1 |
| 失败用例 | `TC-API-01 / TC-API-02 / TC-API-05: api package.json 非占位且与 Nest 源码一致` |
| 失败断言 | 存在 Nest 源码时 `package.json` 应声明 `@nestjs/core`（当前仍为占位包，无 dependencies） |

对应文件：`tests/baseline/ail21-acceptance.test.mjs`  
用例文档：`docs/test/AIL-21-测试用例.md`

## 手工冒烟结果

| 命令 | 退出码 / 摘要 | 对应用例 |
|------|---------------|----------|
| `pnpm install` | 0；550 packages | 前置 |
| `pnpm lint:web` | 0（oxlint + eslint） | TC-WEB-02 |
| `pnpm typecheck:web` | 0 | TC-WEB-03 |
| `pnpm build:web` | 0；Vite 生产构建成功 | 回归 |
| `pnpm --filter @admin-template/web exec prettier --check --experimental-cli src/` | 1；`main.css` / `button/index.ts` / `HomeView.vue` | TC-WEB-04（一般） |
| `pnpm.cmd dev:web` | Vite v8.1.5 ready ~2s，`http://localhost:5173/` | TC-WEB-01（进程级通过） |
| `pnpm lint:api` | 1；`[apps/api] 脚手架尚未落地...`；提示 node_modules missing | TC-API-02 |
| `pnpm dev:api` | 1；同上占位 | TC-API-01 |

## 缺陷

### DEF-01（致命）`apps/api/package.json` 未合入 Nest 依赖与可执行脚本

| 字段 | 内容 |
|------|------|
| 严重级别 | 致命 |
| 复现步骤 | 1. 根目录 `pnpm install`<br>2. `pnpm dev:api` 或 `pnpm lint:api` |
| 期望 | Nest 进程级启动；lint 可跑 |
| 实际 | 脚本执行 `process.exit(1)`，文案「脚手架尚未落地」；无 `@nestjs/*` 依赖，api 无 node_modules |
| 相关路径 | `apps/api/package.json`（对照 AIL-20 附件 `ail-20-apps-api-baseline.zip` 内完整 package.json） |
| 用例 | TC-API-01 / TC-API-02 / TC-API-05 |

说明：仓库已有 `apps/api/src/**`、`eslint.config.mjs`、`nest-cli.json`、`.env.example` 等，与 AIL-20 交付源码大致一致，但 **package.json / lockfile 未同步**，导致基线验收失败。

### DEF-02（轻微）根 README 仍描述 api「占位或由后端基线 Issue 落地」

| 字段 | 内容 |
|------|------|
| 严重级别 | 轻微 |
| 期望 | 与仓库真实状态一致（合入完整 api 后更新） |
| 实际 | 文案滞后；且后端环境变量说明仅覆盖 web |
| 相关路径 | `README.md` |

### DEF-03（一般）前端 Prettier check 未干净

| 字段 | 内容 |
|------|------|
| 严重级别 | 一般 |
| 期望 | `prettier --check src/` 通过或 CI 明确不强制 |
| 实际 | 3 文件风格告警 |
| 相关路径 | `apps/web/src/assets/main.css`、`apps/web/src/components/ui/button/index.ts`、`apps/web/src/views/HomeView.vue` |

## 风险与遗留

1. **AIL-20 虽标 done，但 GitHub 主线未完整吸收其 package.json**，AIL-4 无法收口。
2. 根 README / lockfile 与「可启动 api」状态不一致，后续 Agent 易误判。
3. 本机 Vite HTTP 探活失败不影响「进程级」结论，但若网关/防火墙限制，建议 CI 用 curl 补强。

## 建议下一步（回修项，本 Issue 不改业务代码）

1. **新建/指派回修子 Issue**：将 AIL-20 附件中的 `apps/api/package.json`（及必要 lockfile / README 后端启动与 env 说明）合入 `master`，使 `pnpm install` 后 `pnpm dev:api` / `pnpm lint:api` / `pnpm build:api` 可执行。
2. 合入后重跑：`pnpm test:baseline`、`pnpm lint:api`、`pnpm dev:api`（复制 `.env.example`），再评估关闭 AIL-4。
3. 可选：根 README 显式标注相对 AIL-5（基础设施）/ AIL-6（布局壳）边界；修正 Prettier 3 文件。

## 交付物

| 交付 | 路径 |
|------|------|
| 中文测试用例 | `docs/test/AIL-21-测试用例.md` |
| 自动化验收 | `tests/baseline/ail21-acceptance.test.mjs`；根脚本 `pnpm test:baseline` |
| 本报告 | `docs/test/AIL-21-测试报告.md` |

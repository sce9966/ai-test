# apps/web

前端应用（`@admin-template/web`）：Vue 3 + Vite + TypeScript + Tailwind CSS v4 + shadcn-vue。

## 本地开发

在仓库根目录：

```bash
pnpm install
pnpm dev:web
```

或在本目录：

```bash
pnpm dev
```

## 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Vite 开发服务 |
| `pnpm build` | `vue-tsc` 类型检查 + 生产构建 |
| `pnpm type-check` | 仅 TypeScript / `vue-tsc` |
| `pnpm lint` | ESLint + Oxlint |
| `pnpm format` | Prettier 格式化 `src/` |

根目录等价入口：`pnpm dev:web` / `pnpm build:web` / `pnpm lint:web`。

## 环境变量

复制 `.env.example` 为 `.env`（勿提交真实密钥）：

| 变量 | 含义 |
|------|------|
| `VITE_APP_TITLE` | 浏览器标题前缀 / 顶栏展示名 |
| `VITE_API_BASE_URL` | axios `baseURL`（默认 `/api`） |
| `VITE_API_TIMEOUT_MS` | 请求超时毫秒 |
| `VITE_API_TOKEN` | 鉴权 Token **占位**，仅本地调试 |

## 目录约定

```text
src/
  api/                 # axios 实例与按域 API 模块
  components/layout/   # 中后台布局壳（侧栏 / 顶栏 / 面包屑）
  components/ui/       # shadcn-vue 组件源码
  config/              # 静态导航等配置
  layouts/             # 路由布局（AdminLayout）
  lib/                 # cn 等工具
  router/              # Vue Router
  stores/              # Pinia
  views/               # 路由页面
```

## 布局壳

- `layouts/AdminLayout.vue`：`SidebarProvider` + 侧栏 + 顶栏 + 主内容 `RouterView`
- 静态菜单见 `config/nav.ts`（动态菜单 / 权限由后续 Stage 叠加）
- 面包屑由路由 `meta.title` 推导

## 边界说明

- 主题切换（白 / 浅蓝）由独立 Issue 叠加。
- 登录鉴权、动态菜单、业务 CRUD 不在本 Issue 范围。

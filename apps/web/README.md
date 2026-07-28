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
| `VITE_APP_TITLE` | 浏览器标题前缀 |
| `VITE_API_BASE_URL` | axios `baseURL`（默认 `/api`） |
| `VITE_API_TIMEOUT_MS` | 请求超时毫秒 |
| `VITE_API_TOKEN` | 鉴权 Token **占位**，仅本地调试 |

## 目录约定

```text
src/
  api/           # axios 实例与按域 API 模块
  components/ui/ # shadcn-vue 组件源码
  components/theme/  # 主题切换器
  components/layout/ # 顶栏等布局占位（完整壳见 AIL-6）
  themes/        # 主题注册表与 applyTheme
  lib/           # cn 等工具
  router/        # Vue Router
  stores/        # Pinia（含 theme）
  views/         # 路由页面
docs/
  themes.md      # 主题约定与「如何新增第三套主题」
```

## 主题

默认 `theme-white`，可切换 `theme-light-blue`，偏好写入 `localStorage`。详情见 [`docs/themes.md`](./docs/themes.md)。

## 边界说明

- 本包提供可启动工程基线、主题系统与顶栏主题切换；**完整侧栏布局壳**由 AIL-6 叠加时可复用 `ThemeSwitcher` / `AppHeader`。
- 登录鉴权、业务 CRUD 不在本阶段范围。

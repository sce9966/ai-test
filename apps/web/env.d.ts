/// <reference types="vite/client" />

/**
 * Vite 注入的前端环境变量（与 `.env.example` 对齐）。
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT_MS: string
  readonly VITE_API_TOKEN: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

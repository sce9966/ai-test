/**
 * 应用主题 ID，与 `html` 上的 class 及 CSS 变量块一一对应。
 */
export type ThemeId = 'theme-white' | 'theme-light-blue'

/**
 * 主题元数据：扩展第三套主题时在此登记即可（无需改业务页）。
 */
export interface ThemeDefinition {
  /** 与 CSS class 一致的 ID */
  id: ThemeId
  /** 顶栏切换器展示文案 */
  label: string
  /** 简短说明 */
  description: string
}

/** localStorage 键，刷新后恢复用户偏好 */
export const THEME_STORAGE_KEY = 'admin-template-theme'

/** 默认主题：白色 */
export const DEFAULT_THEME: ThemeId = 'theme-white'

/**
 * 已注册主题列表。新增主题：
 * 1. 扩展 `ThemeId` 联合类型
 * 2. 在 `main.css` 增加 `.theme-xxx { --background: ... }` 变量块
 * 3. 在此数组追加一项
 * 业务页继续使用语义色（`bg-background` / `text-primary` 等），无需改动。
 */
export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'theme-white',
    label: '白色',
    description: '默认中性白底主题',
  },
  {
    id: 'theme-light-blue',
    label: '浅蓝色',
    description: '浅蓝灰背景与蓝色主色',
  },
] as const

const THEME_IDS = new Set<string>(THEMES.map((theme) => theme.id))

/**
 * 判断字符串是否为已注册主题 ID。
 */
export function isThemeId(value: string | null | undefined): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.has(value)
}

/**
 * 从 localStorage 读取主题偏好；非法或缺失时回退默认。
 */
export function readStoredTheme(): ThemeId {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * 将主题 class 写到 `document.documentElement`，并同步 `data-theme`。
 */
export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  for (const definition of THEMES) {
    root.classList.remove(definition.id)
  }
  root.classList.add(theme)
  root.dataset.theme = theme
}

/**
 * 持久化主题偏好到 localStorage。
 */
export function persistTheme(theme: ThemeId): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // 隐私模式等场景下静默失败，运行时主题仍可切换
  }
}

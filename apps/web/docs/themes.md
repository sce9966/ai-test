# 主题系统

本应用通过 **CSS 变量 + `html` class** 实现多主题。业务页与布局壳只使用 Tailwind / shadcn-vue **语义色**（`bg-background`、`text-foreground`、`bg-primary`、`bg-sidebar` 等），不写死具体色值。

## 当前主题

| Class | 说明 | 默认 |
|-------|------|------|
| `theme-white` | 中性白底 | 是 |
| `theme-light-blue` | 浅蓝灰背景 + 蓝色主色 | 否 |

用户偏好键：`localStorage['admin-template-theme']`（与 `src/themes/index.ts` 中 `THEME_STORAGE_KEY` 一致）。

## 相关文件

| 路径 | 职责 |
|------|------|
| `src/assets/main.css` | 各主题的 CSS 变量块 |
| `src/themes/index.ts` | 主题注册表、读写 localStorage、`applyTheme` |
| `src/stores/theme.ts` | Pinia：当前主题与 `setTheme` |
| `src/components/theme/ThemeSwitcher.vue` | 顶栏切换 UI |
| `src/components/layout/AppHeader.vue` | 顶栏挂载切换器（布局壳可复用） |
| `index.html` | 内联脚本，首屏前恢复主题，减轻闪烁 |

## 如何新增第三套主题（无需改业务页）

假设新增 `theme-mint`：

1. **扩展类型与注册表**（`src/themes/index.ts`）  
   - 将 `ThemeId` 改为 `'theme-white' | 'theme-light-blue' | 'theme-mint'`  
   - 在 `THEMES` 数组追加 `{ id: 'theme-mint', label: '薄荷', description: '...' }`

2. **补充 CSS 变量**（`src/assets/main.css`）  
   复制 `.theme-light-blue` 块为 `.theme-mint`，只改 `--background`、`--primary`、`--sidebar*` 等语义变量，保持变量名集合与现有主题一致。

3. **同步首屏脚本**（`index.html`）  
   在内联 `ALLOWED` 对象中加入 `'theme-mint': 1`，并在 `classList.remove(...)` 中包含该 class。

4. **验证**  
   - 顶栏出现新选项  
   - 切换后 Button / 边框 / 背景跟随变化  
   - 刷新后仍为所选主题  

业务页面、布局壳、shadcn 组件**不必**修改，只要继续使用语义色即可。

## 布局壳对接说明

完整侧栏布局（AIL-6）合并时：

- 将 `ThemeSwitcher` 放入其顶栏即可  
- 壳层容器使用 `bg-background`、`bg-sidebar`、`border-border` 等语义类  
- 可保留或替换当前 `AppHeader` 占位

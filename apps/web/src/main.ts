import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

/**
 * 启动时从 localStorage 恢复主题（index.html 内联脚本已尽量避免首屏闪烁）。
 */
useThemeStore(pinia).initTheme()

app.mount('#app')

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LanguagesIcon,
  LayoutPanelLeftIcon,
  MoonIcon,
  SunIcon,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import SliderCaptcha from '@/components/login/SliderCaptcha.vue'
import loginIllustration from '@/assets/login-illustration.svg'
import { setAccessToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const appTitle = import.meta.env.VITE_APP_TITLE || 'Admin Template'
const brandName = computed(() => appTitle.replace(/\s+Template$/i, '') || 'Admin')

const username = ref('admin')
const password = ref('123456')
const remember = ref(true)
const captchaPassed = ref(false)
const showPassword = ref(false)
const isDark = ref(false)

/**
 * 同步并切换浅色 / 深色主题。
 */
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

/**
 * 提交登录表单（仅前端演示，不调用后端）。
 */
function onSubmit(event: Event) {
  event.preventDefault()
  if (!captchaPassed.value) return

  // 页面演示：写入本地 accessToken，后续再对接真实鉴权
  setAccessToken(`demo-token-${username.value}`)

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  void router.replace(redirect)
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})
</script>

<template>
  <div class="relative flex min-h-svh bg-background">
    <!-- 左侧品牌区 -->
    <aside
      class="relative hidden w-[56%] flex-col overflow-hidden px-10 py-8 lg:flex"
      style="
        background:
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(147, 197, 253, 0.45), transparent 55%),
          radial-gradient(ellipse 70% 50% at 80% 80%, rgba(199, 210, 254, 0.5), transparent 50%),
          linear-gradient(160deg, #f8fbff 0%, #eef2ff 45%, #e8f0fe 100%);
      "
    >
      <div class="relative z-10 flex items-center gap-2.5">
        <span
          class="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-sm shadow-blue-500/30"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="size-4 text-white" fill="currentColor">
            <path d="M12 2 3.5 7v10L12 22l8.5-5V7L12 2Zm0 2.3 6.2 3.6v1.4L12 13.1 5.8 9.3V7.9L12 4.3Zm-6.2 6.4 5.7 3.4v5.7l-5.7-3.4V10.7Zm12.4 0v5.7l-5.7 3.4v-5.7l5.7-3.4Z" />
          </svg>
        </span>
        <span class="text-lg font-semibold tracking-tight text-slate-800">{{ brandName }}</span>
      </div>

      <div class="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <img
          :src="loginIllustration"
          alt=""
          class="w-full max-w-[520px] drop-shadow-sm animate-in fade-in zoom-in-95 duration-700"
        />
        <div class="max-w-md text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h2 class="text-2xl font-semibold tracking-tight text-slate-800 xl:text-3xl">
            开箱即用的中后台管理系统
          </h2>
          <p class="mt-3 text-sm text-slate-500 xl:text-base">
            工程化、高性能、跨组件库的前端模版
          </p>
        </div>
      </div>
    </aside>

    <!-- 右侧表单区 -->
    <section class="relative flex w-full flex-1 flex-col lg:w-[44%]">
      <div class="absolute top-5 right-5 z-10 flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="语言" title="语言">
          <GlobeIcon />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="布局" title="布局">
          <LayoutPanelLeftIcon />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="翻译" title="翻译">
          <LanguagesIcon />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          :aria-label="isDark ? '切换浅色模式' : '切换深色模式'"
          :title="isDark ? '浅色模式' : '深色模式'"
          @click="toggleTheme"
        >
          <SunIcon v-if="isDark" />
          <MoonIcon v-else />
        </Button>
      </div>

      <div class="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div class="w-full max-w-[360px] animate-in fade-in slide-in-from-right-2 duration-500">
          <header class="mb-8">
            <h1 class="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              欢迎回来 <span aria-hidden="true">👋</span>
            </h1>
            <p class="mt-2 text-sm text-muted-foreground">
              请输入您的账户信息以开始管理您的项目
            </p>
          </header>

          <form class="flex flex-col gap-4" @submit="onSubmit">
            <Input
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="用户名"
              class="h-10"
              aria-label="用户名"
            />

            <div class="relative">
              <Input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="密码"
                class="h-10 pr-10"
                aria-label="密码"
              />
              <button
                type="button"
                class="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <EyeOffIcon v-if="showPassword" class="size-4" />
                <EyeIcon v-else class="size-4" />
              </button>
            </div>

            <SliderCaptcha v-model="captchaPassed" />

            <div class="flex items-center justify-between gap-3 pt-0.5">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox v-model:checked="remember" />
                <span>记住账号</span>
              </label>
              <button
                type="button"
                class="text-sm text-blue-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-blue-400"
              >
                忘记密码?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              class="mt-1 h-10 w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
              :disabled="!captchaPassed"
            >
              登录
            </Button>
          </form>
        </div>
      </div>

      <footer class="px-6 pb-5 text-center text-xs text-muted-foreground">
        Copyright © {{ new Date().getFullYear() }} {{ brandName }}
      </footer>
    </section>
  </div>
</template>

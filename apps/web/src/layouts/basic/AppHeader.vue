<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BellIcon,
  GlobeIcon,
  HomeIcon,
  LockIcon,
  LogOutIcon,
  MaximizeIcon,
  MinimizeIcon,
  MoonIcon,
  PanelLeftIcon,
  RotateCwIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLayoutStore } from '@/stores/layout'
import { useTabsStore } from '@/stores/tabs'
import { clearAccessToken } from '@/utils/auth'
import { resolveBreadcrumbs, appMenus } from './menus'

const route = useRoute()
const router = useRouter()
const layout = useLayoutStore()
const tabsStore = useTabsStore()
const isFullscreen = ref(false)
const refreshContent = inject<() => void>('layoutRefresh')

const breadcrumbs = computed(() => resolveBreadcrumbs(appMenus, route.path))

/** 演示用当前用户信息 */
const currentUser = {
  name: 'Admin',
  account: 'admin',
}

/**
 * 切换浏览器全屏状态。
 */
async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
    isFullscreen.value = true
    return
  }
  await document.exitFullscreen()
  isFullscreen.value = false
}

/**
 * 刷新当前内容区。
 */
function refreshPage() {
  refreshContent?.()
}

/**
 * 同步全屏状态变化。
 */
function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

/**
 * 退出登录（前端演示：清除凭证、清空页签并跳转登录页）。
 */
function logout() {
  clearAccessToken()
  tabsStore.resetTabs()
  void router.push('/login')
}

onMounted(() => {
  layout.syncThemeFromDom()
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
  <header class="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
    <div class="flex min-w-0 flex-1 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="切换侧边栏"
        title="切换侧边栏"
        @click="layout.toggleSidebar()"
      >
        <PanelLeftIcon />
      </Button>

      <nav
        class="ml-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="面包屑"
      >
        <HomeIcon class="size-3.5 shrink-0" />
        <template v-for="(item, index) in breadcrumbs" :key="item.path">
          <span class="text-border">/</span>
          <span
            :class="index === breadcrumbs.length - 1 ? 'truncate text-foreground' : 'truncate'"
          >
            {{ item.title }}
          </span>
        </template>
      </nav>
    </div>

    <div class="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        class="cursor-pointer mr-1 hidden h-8 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-xs text-muted-foreground transition-colors hover:bg-muted md:inline-flex"
        aria-label="搜索"
      >
        <SearchIcon class="size-3.5" />
        <span>搜索</span>
        <kbd
          class="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px]"
        >
          Ctrl K
        </kbd>
      </button>

      <Button class="cursor-pointer" type="button" variant="ghost" size="icon-sm" aria-label="设置" title="设置">
        <SettingsIcon />
      </Button>
      <Button
        class="cursor-pointer"
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="layout.isDark ? '切换浅色模式' : '切换深色模式'"
        :title="layout.isDark ? '浅色模式' : '深色模式'"
        @click="layout.toggleTheme()"
      >
        <SunIcon v-if="layout.isDark" />
        <MoonIcon v-else />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="语言" title="语言">
        <GlobeIcon />
      </Button>
      <Button
        class="cursor-pointer"
        type="button"
        variant="ghost"
        size="icon-sm"
        :aria-label="isFullscreen ? '退出全屏' : '全屏'"
        :title="isFullscreen ? '退出全屏' : '全屏'"
        @click="toggleFullscreen"
      >
        <MinimizeIcon v-if="isFullscreen" />
        <MaximizeIcon v-else />
      </Button>
      <Button
        class="cursor-pointer"
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="刷新"
        title="刷新"
        @click="refreshPage"
      >
        <RotateCwIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="cursor-pointer relative"
        aria-label="通知"
        title="通知"
      >
        <BellIcon />
        <span class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-red-500" />
      </Button>
      <Button class="cursor-pointer" type="button" variant="ghost" size="icon-sm" aria-label="锁屏" title="锁屏">
        <LockIcon />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            type="button"
            class="cursor-pointer ml-1 flex size-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label="用户菜单"
            title="用户"
          >
            {{ currentUser.name.slice(0, 1).toUpperCase() }}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col gap-0.5">
              <span class="text-sm font-medium text-foreground">{{ currentUser.name }}</span>
              <span class="text-xs text-muted-foreground">{{ currentUser.account }}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon />
            个人中心
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon />
            账户设置
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" @click="logout">
            <LogOutIcon />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>

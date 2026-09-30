<script setup lang="ts">
import { computed } from 'vue'
import { ChevronsLeftIcon } from '@lucide/vue'
import { useLayoutStore } from '@/stores/layout'
import { appMenus } from './menus'
import SidebarMenuItem from './SidebarMenuItem.vue'

const layout = useLayoutStore()

const appTitle = import.meta.env.VITE_APP_TITLE || 'Admin Template'
const brandName = computed(() => appTitle.replace(/\s+Template$/i, '') || 'Admin')
</script>

<template>
  <aside
    class="flex h-full flex-col border-r border-border bg-background transition-[width] duration-200"
    :style="{ width: layout.sidebarWidth }"
  >
    <div
      class="flex h-14 shrink-0 items-center gap-2.5 overflow-hidden border-b border-border px-4"
      :class="layout.sidebarCollapsed && 'justify-center px-2'"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 shadow-sm shadow-blue-500/30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" class="size-4 text-white" fill="currentColor">
          <path
            d="M12 2 3.5 7v10L12 22l8.5-5V7L12 2Zm0 2.3 6.2 3.6v1.4L12 13.1 5.8 9.3V7.9L12 4.3Zm-6.2 6.4 5.7 3.4v5.7l-5.7-3.4V10.7Zm12.4 0v5.7l-5.7 3.4v-5.7l5.7-3.4Z"
          />
        </svg>
      </span>
      <span
        v-show="!layout.sidebarCollapsed"
        class="truncate text-base font-semibold tracking-tight"
      >
        {{ brandName }}
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <ul class="flex flex-col gap-1">
        <SidebarMenuItem v-for="item in appMenus" :key="item.path" :item="item" />
      </ul>
    </nav>

    <div class="border-t border-border p-2">
      <button
        type="button"
        class="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        :aria-label="layout.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        :title="layout.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="layout.toggleSidebar()"
      >
        <ChevronsLeftIcon
          class="size-4 transition-transform"
          :class="layout.sidebarCollapsed && 'rotate-180'"
        />
      </button>
    </div>
  </aside>
</template>

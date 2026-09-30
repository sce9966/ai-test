<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { XIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

watch(
  () => route.fullPath,
  () => {
    if (route.meta.layout === false) return
    tabsStore.openTab(route)
  },
  { immediate: true },
)

/**
 * 激活指定页签并跳转。
 */
function activateTab(path: string) {
  if (route.path !== path) {
    void router.push(path)
  }
}

/**
 * 关闭页签；若关闭当前页则跳转到相邻页签。
 */
function onCloseTab(path: string) {
  const nextPath = tabsStore.closeTab(path)
  if (nextPath) {
    void router.push(nextPath)
  }
}
</script>

<template>
  <div
    class="flex h-10 shrink-0 items-end gap-0 overflow-x-auto border-b border-border bg-background px-3"
    role="tablist"
  >
    <div
      v-for="tab in tabsStore.tabs"
      :key="tab.path"
      role="tab"
      :aria-selected="tabsStore.activePath === tab.path"
      tabindex="0"
      :class="
        cn(
          'group flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-t-md px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          tabsStore.activePath === tab.path
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
            : 'text-foreground/80 hover:text-foreground',
        )
      "
      @click="activateTab(tab.path)"
      @keydown.enter.prevent="activateTab(tab.path)"
      @click.middle.prevent="!tab.affix && onCloseTab(tab.path)"
    >
      <component
        :is="tab.icon"
        v-if="tab.icon"
        class="size-4 shrink-0"
        :class="tabsStore.activePath === tab.path ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'"
      />
      <span class="whitespace-nowrap">{{ tab.title }}</span>
      <button
        v-if="!tab.affix"
        type="button"
        class="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
        aria-label="关闭页签"
        @click.stop="onCloseTab(tab.path)"
      >
        <XIcon class="size-3.5" />
      </button>
    </div>
  </div>
</template>

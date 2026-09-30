<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { useLayoutStore } from '@/stores/layout'
import { isMenuActive, type AppMenuItem } from './menus'

const props = withDefaults(
  defineProps<{
    /** 菜单项 */
    item: AppMenuItem
    /** 嵌套层级，从 0 开始 */
    depth?: number
  }>(),
  {
    depth: 0,
  },
)

const route = useRoute()
const router = useRouter()
const layout = useLayoutStore()

const hasChildren = computed(() => Boolean(props.item.children?.length))
const active = computed(() => isMenuActive(props.item, route.path))
const expanded = ref(active.value)

watch(active, (value) => {
  if (value) expanded.value = true
})

watch(
  () => layout.sidebarCollapsed,
  (collapsed) => {
    if (collapsed) expanded.value = false
  },
)

const itemPadding = computed(() => {
  if (layout.sidebarCollapsed) return undefined
  return { paddingLeft: `${12 + props.depth * 12}px` }
})

/**
 * 点击菜单项：有子级则展开/收起，否则跳转。
 */
function onClick() {
  if (hasChildren.value) {
    if (layout.sidebarCollapsed) {
      layout.toggleSidebar()
      expanded.value = true
      return
    }
    expanded.value = !expanded.value
    return
  }

  if (route.path !== props.item.path) {
    void router.push(props.item.path)
  }
}
</script>

<template>
  <li>
    <button
      type="button"
      :title="item.title"
      :aria-expanded="hasChildren ? expanded : undefined"
      :style="itemPadding"
      :class="
        cn(
          'flex w-full items-center gap-3 rounded-lg py-2.5 pr-3 text-sm transition-colors',
          layout.sidebarCollapsed ? 'justify-center px-2' : 'px-3',
          active && hasChildren && 'font-medium text-blue-600 dark:text-blue-400',
          active && !hasChildren &&
            'bg-blue-50 font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
          !active && 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      "
      @click="onClick"
    >
      <component :is="item.icon" v-if="item.icon" class="size-4 shrink-0" />
      <span
        v-else-if="!layout.sidebarCollapsed"
        class="size-1.5 shrink-0 rounded-full bg-current opacity-40"
        aria-hidden="true"
      />
      <span v-show="!layout.sidebarCollapsed" class="min-w-0 flex-1 truncate text-left">
        {{ item.title }}
      </span>
      <ChevronDownIcon
        v-if="hasChildren && !layout.sidebarCollapsed"
        class="size-4 shrink-0 transition-transform duration-200"
        :class="expanded ? 'rotate-0' : '-rotate-90'"
      />
    </button>

    <ul
      v-if="hasChildren && expanded && !layout.sidebarCollapsed"
      class="mt-1 flex flex-col gap-1"
    >
      <SidebarMenuItem
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>

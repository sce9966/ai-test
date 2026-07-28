<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/theme'
import type { ThemeId } from '@/themes'

const themeStore = useThemeStore()
const { theme, themes } = storeToRefs(themeStore)

/**
 * 选择主题并持久化。
 */
function onSelect(next: ThemeId) {
  themeStore.setTheme(next)
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-1"
    role="group"
    aria-label="主题切换"
  >
    <Button
      v-for="item in themes"
      :key="item.id"
      type="button"
      size="sm"
      :variant="theme === item.id ? 'default' : 'ghost'"
      :aria-pressed="theme === item.id"
      :title="item.description"
      @click="onSelect(item.id)"
    >
      {{ item.label }}
    </Button>
  </div>
</template>

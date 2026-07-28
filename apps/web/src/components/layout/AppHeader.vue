<script setup lang="ts">
import ThemeSwitcher from '@/components/theme/ThemeSwitcher.vue'

/**
 * 顶栏占位：主题切换入口。完整侧栏/面包屑布局壳由 AIL-6 叠加时可复用本组件或迁入其 Header。
 */
</script>

<template>
  <header
    class="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80"
  >
    <div class="flex min-w-0 flex-col gap-0.5">
      <span class="truncate text-sm font-semibold tracking-tight text-foreground">
        Admin Template
      </span>
      <span class="truncate text-xs text-muted-foreground">主题跟随 CSS 语义变量</span>
    </div>
    <ThemeSwitcher />
  </header>
</template>

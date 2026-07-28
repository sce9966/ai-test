<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/stores/counter'
import { useThemeStore } from '@/stores/theme'

const counter = useCounterStore()
const themeStore = useThemeStore()
const { theme, currentLabel } = storeToRefs(themeStore)
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
    <div class="flex flex-col gap-2">
      <p class="text-sm text-muted-foreground">@admin-template/web</p>
      <h1 class="text-3xl font-semibold tracking-tight text-foreground">主题系统已接入</h1>
      <p class="text-muted-foreground">
        当前主题：{{ currentLabel }}（{{ theme }}）。页面与 shadcn-vue 组件使用语义色（如
        <code class="text-foreground">bg-background</code> /
        <code class="text-foreground">bg-primary</code>），切换主题无需改业务页。
      </p>
    </div>

    <div
      class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <p class="text-sm font-medium">语义色预览</p>
      <div class="flex flex-wrap items-center gap-3">
        <Button type="button" @click="counter.increment"> 主色按钮 · {{ counter.count }} </Button>
        <Button type="button" variant="secondary">次要</Button>
        <Button type="button" variant="outline">描边</Button>
        <Button type="button" variant="ghost">幽灵</Button>
      </div>
      <p class="text-sm text-muted-foreground">
        顶栏可切换「白色 / 浅蓝色」；刷新后偏好会从 localStorage 恢复。
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <main class="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 px-6 py-12">
    <div class="flex flex-col gap-2">
      <p class="text-sm text-muted-foreground">@admin-template/web</p>
      <h1 class="text-3xl font-semibold tracking-tight">前端工程基线已就绪</h1>
      <p class="text-muted-foreground">
        Vue 3 + Vite + TypeScript + Tailwind + shadcn-vue。布局壳由后续 Issue
        叠加；此处仅验证工程可启动与 UI 组件可引用。
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Button type="button" @click="counter.increment">
        Pinia 计数：{{ counter.count }}
      </Button>
      <Button type="button" variant="outline" as-child>
        <a href="https://www.shadcn-vue.com/" target="_blank" rel="noreferrer">
          shadcn-vue
        </a>
      </Button>
    </div>
  </main>
</template>

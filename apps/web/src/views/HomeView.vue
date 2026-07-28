<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight">首页</h1>
      <p class="max-w-2xl text-muted-foreground">
        Vue 3 + Vite + TypeScript + Tailwind + shadcn-vue。侧栏、顶栏、主内容区与面包屑已接线；
        此处验证布局壳与 Pinia / UI 组件可正常使用。
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <Button type="button" @click="counter.increment">
        Pinia 计数：{{ counter.count }}
      </Button>
      <Button type="button" variant="outline" as-child>
        <a href="https://www.shadcn-vue.com/" target="_blank" rel="noreferrer"> shadcn-vue </a>
      </Button>
    </div>
  </section>
</template>

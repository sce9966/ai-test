<script setup lang="ts">
import { provide, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppTabs from './AppTabs.vue'

const contentKey = ref(0)

/**
 * 供 Header 刷新按钮调用：强制重建当前路由视图。
 */
function refreshContent() {
  contentKey.value += 1
}

provide('layoutRefresh', refreshContent)
</script>

<template>
  <div class="flex h-svh overflow-hidden bg-muted/40 text-foreground">
    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <AppTabs />

      <main class="min-h-0 flex-1 overflow-auto p-4">
        <RouterView :key="contentKey" />
      </main>
    </div>
  </div>
</template>

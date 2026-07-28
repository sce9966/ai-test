<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <AppHeader />
    <div class="flex-1">
      <RouterView />
    </div>
  </div>
</template>

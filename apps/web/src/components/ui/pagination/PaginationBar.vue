<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

/**
 * 翻到上一页。
 */
function prev() {
  if (props.page > 1) {
    emit('update:page', props.page - 1)
  }
}

/**
 * 翻到下一页。
 */
function next() {
  if (props.page < pageCount.value) {
    emit('update:page', props.page + 1)
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 text-sm text-muted-foreground">
    <span>共 {{ total }} 条</span>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        :disabled="page <= 1"
        @click="prev"
      >
        上一页
      </Button>
      <span>{{ page }} / {{ pageCount }}</span>
      <Button
        variant="outline"
        size="sm"
        :disabled="page >= pageCount"
        @click="next"
      >
        下一页
      </Button>
    </div>
  </div>
</template>

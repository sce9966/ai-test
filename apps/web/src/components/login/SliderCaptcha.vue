<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ChevronsRightIcon, CheckIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    /** 是否已通过校验 */
    modelValue?: boolean
    /** 额外 class */
    class?: string
  }>(),
  {
    modelValue: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const trackRef = ref<HTMLElement | null>(null)
const dragging = ref(false)
const offsetX = ref(0)
const passed = computed(() => props.modelValue)

const HANDLE_SIZE = 44
const PASS_THRESHOLD = 0.92

/**
 * 根据指针位置更新滑块偏移，并在达到阈值时标记通过。
 */
function updateOffset(clientX: number) {
  const track = trackRef.value
  if (!track || passed.value) return

  const rect = track.getBoundingClientRect()
  const max = rect.width - HANDLE_SIZE
  const next = Math.min(Math.max(0, clientX - rect.left - HANDLE_SIZE / 2), max)
  offsetX.value = next

  if (next / max >= PASS_THRESHOLD) {
    offsetX.value = max
    emit('update:modelValue', true)
    dragging.value = false
  }
}

/**
 * 开始拖动滑块。
 */
function onPointerDown(event: PointerEvent) {
  if (passed.value) return
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  updateOffset(event.clientX)
}

/**
 * 拖动中更新位置。
 */
function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  updateOffset(event.clientX)
}

/**
 * 结束拖动；未通过时回弹。
 */
function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  if (!passed.value) {
    offsetX.value = 0
  }
}

onBeforeUnmount(() => {
  dragging.value = false
})
</script>

<template>
  <div
    ref="trackRef"
    role="slider"
    :aria-valuenow="Math.round((offsetX / Math.max(1, (trackRef?.clientWidth ?? 1) - HANDLE_SIZE)) * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="passed ? '验证通过' : '请按住滑块拖动完成验证'"
    :class="
      cn(
        'relative h-11 w-full select-none overflow-hidden rounded-lg border border-border bg-muted/60',
        passed && 'border-emerald-500/40 bg-emerald-50',
        props.class,
      )
    "
  >
    <div
      class="pointer-events-none absolute inset-y-0 left-0 bg-emerald-500/15 transition-[width] duration-150"
      :style="{ width: `${offsetX + HANDLE_SIZE / 2}px` }"
    />

    <p
      class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm transition-colors"
      :class="passed ? 'text-emerald-600' : 'text-muted-foreground'"
    >
      {{ passed ? '验证通过' : '请按住滑块拖动' }}
    </p>

    <button
      type="button"
      class="absolute top-0 left-0 flex size-11 items-center justify-center rounded-lg border bg-background shadow-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
      :class="
        passed
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-border text-muted-foreground hover:text-foreground'
      "
      :style="{ transform: `translateX(${offsetX}px)` }"
      :aria-disabled="passed"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <CheckIcon v-if="passed" class="size-5" />
      <ChevronsRightIcon v-else class="size-5" />
    </button>
  </div>
</template>

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 计数器 Store 占位：演示 Pinia 接线，后续可替换为真实业务状态。
 */
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  /**
   * 将计数加一。
   */
  function increment() {
    count.value += 1
  }

  return { count, doubleCount, increment }
})

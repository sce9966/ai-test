<script setup lang="ts">
import { ref, watch } from 'vue'
import { importGiftCodes } from '@/api/gift-code'
import { getApiErrorMessage } from '@/api/http'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  goodsId?: string
  goodsName?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'imported'): void
}>()

const rawText = ref('')
const submitting = ref(false)
const message = ref('')
const isError = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      rawText.value = ''
      message.value = ''
      isError.value = false
    }
  },
)

/**
 * 从文本解析兑换码（一码一行）。
 *
 * @param text 原始文本
 */
function parseCodes(text: string): string[] {
  return text
    .split(/[\r\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * 读取 txt / csv 文件。
 *
 * @param event 文件选择事件
 */
function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    rawText.value = String(reader.result || '')
  }
  reader.readAsText(file)
}

/**
 * 提交导入。
 */
async function onSubmit() {
  if (!props.goodsId) {
    return
  }
  const codes = parseCodes(rawText.value)
  if (codes.length === 0) {
    isError.value = true
    message.value = '请粘贴或上传兑换码（一码一行）'
    return
  }
  submitting.value = true
  isError.value = false
  message.value = ''
  try {
    const result = await importGiftCodes(props.goodsId, codes)
    const failedText = result.failed.length
      ? `，失败 ${result.failed.length} 条：${result.failed
          .slice(0, 5)
          .map((item) => `${item.code}(${item.reason})`)
          .join('；')}`
      : ''
    message.value = `成功导入 ${result.successCount} 条${failedText}`
    isError.value = result.failed.length > 0 && result.successCount === 0
    if (result.successCount > 0) {
      emit('imported')
    }
  } catch (error) {
    isError.value = true
    message.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>批量导入兑换码</DialogTitle>
        <DialogDescription>
          {{ goodsName }}（{{ goodsId }}），支持 txt / csv，一码一行
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-2">
        <Label>兑换码</Label>
        <Textarea v-model="rawText" class="min-h-40" placeholder="每行一个兑换码" />
        <input
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          class="text-sm"
          @change="onPickFile"
        >
        <p
          v-if="message"
          class="text-sm"
          :class="isError ? 'text-destructive' : 'text-muted-foreground'"
        >
          {{ message }}
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">关闭</Button>
        <Button :disabled="submitting" @click="onSubmit">
          {{ submitting ? '导入中...' : '导入' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

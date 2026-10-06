<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Cropper, type CropperResult } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { Trash2Icon, UploadIcon, ZoomInIcon, ZoomOutIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cropImageToBlob, type CropArea } from './cropImage'

/**
 * 图片上传组件属性。
 */
interface ImageUploaderProps {
  /**
   * 裁剪宽高比（宽 / 高）。
   */
  aspectRatio?: number
  /**
   * 最大文件体积（字节）。
   */
  maxSize?: number
  /**
   * 允许的 MIME 类型。
   */
  acceptedFileTypes?: string[]
  /**
   * 容器 class。
   */
  class?: string
  /**
   * 卡片标题。
   */
  title?: string
  /**
   * 是否禁用。
   */
  disabled?: boolean
  /**
   * 裁剪完成后是否清空预览，便于连续添加。
   */
  clearAfterCrop?: boolean
  /**
   * 紧凑模式，适合嵌在表单中（无卡片外壳）。
   */
  compact?: boolean
}

const props = withDefaults(defineProps<ImageUploaderProps>(), {
  aspectRatio: 1,
  maxSize: 5 * 1024 * 1024,
  acceptedFileTypes: () => ['image/jpeg', 'image/png', 'image/webp'],
  title: '图片上传',
  disabled: false,
  clearAfterCrop: false,
  compact: false,
})

const emit = defineEmits<{
  imageCropped: [blob: Blob]
  cleared: []
}>()

const image = ref<string | null>(null)
const previewImage = ref<string | null>(null)
const cropArea = ref<CropArea | null>(null)
const zoom = ref(1)
const error = ref<string | null>(null)
const isCropDialogOpen = ref(false)
const isDragging = ref(false)
const applying = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const cropperRef = ref<{
  zoom: (factor: number) => void
  getResult: () => CropperResult
} | null>(null)

const acceptAttr = computed(() => props.acceptedFileTypes.join(','))
const formatHint = computed(() =>
  props.acceptedFileTypes.map((type) => type.replace('image/', '.')).join(', '),
)
const maxSizeMb = computed(() => props.maxSize / (1024 * 1024))

/**
 * 释放预览 URL。
 *
 * @param url 对象 URL
 */
function revokePreview(url: string | null) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * 校验并读取本地图片。
 *
 * @param file 选中的文件
 */
function handleFileSelect(file: File | null) {
  if (!file || props.disabled) {
    return
  }

  error.value = null

  if (!props.acceptedFileTypes.includes(file.type)) {
    error.value = `不支持该文件类型。允许：${props.acceptedFileTypes.join(', ')}`
    return
  }

  if (file.size > props.maxSize) {
    error.value = `文件过大。最大 ${maxSizeMb.value}MB`
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    image.value = String(reader.result)
    zoom.value = 1
    cropArea.value = null
    isCropDialogOpen.value = true
  }
  reader.readAsDataURL(file)
}

/**
 * 记录裁剪区域。
 *
 * @param payload 裁剪结果
 */
function onCropChange(payload: CropperResult) {
  cropArea.value = payload.coordinates
}

/**
 * 应用裁剪并输出 Blob。
 */
async function applyCrop() {
  if (!image.value) {
    return
  }

  const coordinates = cropArea.value ?? cropperRef.value?.getResult()?.coordinates
  if (!coordinates) {
    return
  }

  applying.value = true
  error.value = null
  try {
    const blob = await cropImageToBlob(image.value, coordinates)
    revokePreview(previewImage.value)
    if (props.clearAfterCrop) {
      previewImage.value = null
      image.value = null
    } else {
      previewImage.value = URL.createObjectURL(blob)
    }
    emit('imageCropped', blob)
    isCropDialogOpen.value = false
  } catch (cropError) {
    error.value = cropError instanceof Error ? cropError.message : '裁剪失败'
  } finally {
    applying.value = false
  }
}

/**
 * 清空当前图片。
 */
function clearImage() {
  revokePreview(previewImage.value)
  previewImage.value = null
  image.value = null
  cropArea.value = null
  zoom.value = 1
  error.value = null
  emit('cleared')
}

/**
 * 按滑块绝对值调整裁剪缩放。
 *
 * @param values 缩放值
 */
function onZoomChange(values: number[] | undefined) {
  const next = values?.[0] ?? 1
  const factor = next / zoom.value
  if (factor !== 1) {
    cropperRef.value?.zoom(factor)
  }
  zoom.value = next
}

/**
 * 打开文件选择。
 */
function openFilePicker() {
  if (props.disabled) {
    return
  }
  inputRef.value?.click()
}

/**
 * 处理文件 input 变更。
 *
 * @param event 变更事件
 */
function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  handleFileSelect(input.files?.[0] ?? null)
  input.value = ''
}

/**
 * 阻止拖拽默认行为。
 *
 * @param event 拖拽事件
 */
function preventDrag(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * 拖入投放区。
 *
 * @param event 拖拽事件
 */
function onDragEnter(event: DragEvent) {
  preventDrag(event)
  if (!props.disabled) {
    isDragging.value = true
  }
}

/**
 * 拖离投放区。
 *
 * @param event 拖拽事件
 */
function onDragLeave(event: DragEvent) {
  preventDrag(event)
  isDragging.value = false
}

/**
 * 放下文件。
 *
 * @param event 拖拽事件
 */
function onDrop(event: DragEvent) {
  preventDrag(event)
  isDragging.value = false
  handleFileSelect(event.dataTransfer?.files?.[0] ?? null)
}

/**
 * 关闭裁剪弹窗。
 *
 * @param open 是否打开
 */
function onCropDialogOpenChange(open: boolean) {
  isCropDialogOpen.value = open
  if (!open) {
    zoom.value = 1
  }
}

onBeforeUnmount(() => {
  revokePreview(previewImage.value)
})
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <component :is="compact ? 'div' : Card">
      <CardHeader v-if="!compact" class="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{{ title }}</CardTitle>
        <TooltipProvider v-if="previewImage">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="icon" :disabled="disabled" @click="clearImage">
                <Trash2Icon class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>清除图片</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <component :is="compact ? 'div' : CardContent">
        <div class="flex flex-col items-center justify-center gap-4">
          <div
            v-if="!previewImage"
            :class="
              cn(
                'w-full cursor-pointer rounded-lg border-2 border-dashed text-center transition-colors',
                compact ? 'p-6' : 'p-12',
                'border-muted-foreground/25 hover:bg-muted/50',
                isDragging && 'bg-muted/50 border-primary/40',
                disabled && 'pointer-events-none opacity-50',
              )
            "
            @click="openFilePicker"
            @dragenter="onDragEnter"
            @dragover="preventDrag"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <input
              ref="inputRef"
              type="file"
              class="hidden"
              :accept="acceptAttr"
              :disabled="disabled"
              @change="onInputChange"
            />
            <div class="flex flex-col items-center gap-2">
              <UploadIcon :class="cn('text-muted-foreground', compact ? 'size-6' : 'size-8')" />
              <p class="text-muted-foreground text-sm">拖拽图片到此处，或点击选择文件</p>
              <p class="text-muted-foreground text-xs">支持格式：{{ formatHint }}</p>
              <p class="text-muted-foreground text-xs">最大 {{ maxSizeMb }}MB</p>
            </div>
            <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
          </div>

          <div v-else class="relative w-full">
            <img
              :src="previewImage"
              alt="预览"
              :class="cn('mx-auto rounded-lg object-contain', compact ? 'max-h-[160px]' : 'max-h-[300px]')"
            />
            <div class="absolute right-2 bottom-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                :disabled="disabled"
                @click="isCropDialogOpen = true"
              >
                编辑
              </Button>
              <Button v-if="compact" variant="outline" size="sm" :disabled="disabled" @click="clearImage">
                清除
              </Button>
            </div>
          </div>
        </div>
      </component>

      <CardFooter v-if="!compact">
        <p class="text-muted-foreground text-sm">上传图片后可预览并裁剪</p>
      </CardFooter>
    </component>

    <Dialog :open="isCropDialogOpen" @update:open="onCropDialogOpenChange">
      <DialogContent class="z-[80] sm:max-w-[500px]" overlay-class="z-[70]">
        <DialogHeader>
          <DialogTitle>裁剪图片</DialogTitle>
        </DialogHeader>
        <template v-if="image">
          <div class="relative h-[300px] w-full overflow-hidden rounded-md">
            <Cropper
              ref="cropperRef"
              class="h-full bg-black"
              :src="image"
              :stencil-props="{ aspectRatio }"
              image-restriction="stencil"
              @change="onCropChange"
            />
          </div>
          <div class="flex items-center gap-2">
            <ZoomOutIcon class="size-4 shrink-0" />
            <Slider :model-value="[zoom]" :min="1" :max="3" :step="0.1" @update:model-value="onZoomChange" />
            <ZoomInIcon class="size-4 shrink-0" />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="onCropDialogOpenChange(false)">取消</Button>
            <Button :disabled="applying" @click="applyCrop">
              {{ applying ? '处理中...' : '应用' }}
            </Button>
          </div>
        </template>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.vue-advanced-cropper) {
  height: 100%;
}
</style>

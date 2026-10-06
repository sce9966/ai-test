<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { getApiErrorMessage } from '@/api/http'
import { uploadFile } from '@/api/upload'
import {
  createVirtualGoods,
  updateVirtualGoods,
  type VirtualGoods,
  type VirtualGoodsKind,
} from '@/api/virtual-goods'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/image-uploader'

const props = defineProps<{
  open: boolean
  kind: VirtualGoodsKind
  mode: 'create' | 'edit' | 'detail'
  goods?: VirtualGoods | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'saved'): void
}>()

const submitting = ref(false)
const errorMessage = ref('')
const uploading = ref(false)

const form = reactive({
  name: '',
  price: '',
  linePrice: '',
  remark: '',
  coverUrls: [] as string[],
  durationDays: '30',
  status: '1',
  subtitle: '',
  sort: '0',
  groupName: '',
})

const readonly = computed(() => props.mode === 'detail')
const title = computed(() => {
  const typeName = props.kind === 'member' ? '会员' : '商品'
  if (props.mode === 'create') return `新增${typeName}`
  if (props.mode === 'edit') return `编辑${typeName}`
  return `${typeName}详情`
})

/**
 * 用商品数据或默认值填充表单。
 */
function fillForm() {
  errorMessage.value = ''
  if (props.goods) {
    form.name = props.goods.name
    form.price = String(props.goods.price)
    form.linePrice = String(props.goods.linePrice)
    form.remark = props.goods.remark
    form.coverUrls = [...(props.goods.coverUrls || [])]
    form.durationDays = String(props.goods.durationDays)
    form.status = String(props.goods.status)
    form.subtitle = props.goods.subtitle || ''
    form.sort = String(props.goods.sort ?? 0)
    form.groupName = props.goods.groupName || ''
    return
  }
  form.name = ''
  form.price = ''
  form.linePrice = ''
  form.remark = ''
  form.coverUrls = []
  form.durationDays = '30'
  form.status = '1'
  form.subtitle = ''
  form.sort = '0'
  form.groupName = ''
}

watch(
  () => [props.open, props.goods, props.mode] as const,
  () => {
    if (props.open) {
      fillForm()
    }
  },
)

/**
 * 关闭弹窗。
 */
function close() {
  emit('update:open', false)
}

/**
 * 将裁剪后的封面上传到服务器。
 *
 * @param blob 裁剪结果
 */
async function onCoverCropped(blob: Blob) {
  const file = new File([blob], `cover-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
  uploading.value = true
  errorMessage.value = ''
  try {
    const result = await uploadFile(file)
    form.coverUrls.push(result.url)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    uploading.value = false
  }
}

/**
 * 移除封面。
 *
 * @param index 下标
 */
function removeCover(index: number) {
  form.coverUrls.splice(index, 1)
}

/**
 * 提交新增或编辑。
 */
async function onSubmit() {
  if (readonly.value) {
    close()
    return
  }
  errorMessage.value = ''
  if (!form.name.trim()) {
    errorMessage.value = '名称不能为空'
    return
  }
  if (!form.remark.trim()) {
    errorMessage.value = '备注不能为空'
    return
  }
  if (form.coverUrls.length === 0) {
    errorMessage.value = '至少上传一张封面'
    return
  }
  const price = Number(form.price)
  const linePrice = Number(form.linePrice)
  const durationDays = Number(form.durationDays)
  if (Number.isNaN(price) || Number.isNaN(linePrice) || Number.isNaN(durationDays)) {
    errorMessage.value = '请填写合法的价格与时长'
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: form.name.trim(),
      price,
      linePrice,
      remark: form.remark.trim(),
      coverUrls: form.coverUrls,
      durationDays,
      status: Number(form.status),
      subtitle: form.subtitle.trim() || undefined,
      sort: Number(form.sort) || 0,
      groupName: form.groupName.trim() || undefined,
    }
    if (props.mode === 'create') {
      await createVirtualGoods({ ...payload, kind: props.kind })
    } else if (props.goods) {
      await updateVirtualGoods(props.goods.id, payload)
    }
    emit('saved')
    close()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="goods?.goodsId"> 商品ID：{{ goods.goodsId }} </DialogDescription>
      </DialogHeader>

      <div class="grid gap-3">
        <div class="grid gap-1.5">
          <Label>{{ kind === 'member' ? '会员名称' : '课程名称' }}</Label>
          <Input v-model="form.name" maxlength="20" :disabled="readonly" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1.5">
            <Label>单价</Label>
            <Input v-model="form.price" :disabled="readonly" />
          </div>
          <div class="grid gap-1.5">
            <Label>划线价</Label>
            <Input v-model="form.linePrice" :disabled="readonly" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1.5">
            <Label>有效时长（天）</Label>
            <Input v-model="form.durationDays" :disabled="readonly" />
          </div>
          <div class="grid gap-1.5">
            <Label>状态</Label>
            <Select v-model="form.status" :disabled="readonly">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="1">上架</SelectItem>
                  <SelectItem value="0">下架</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div v-if="kind === 'course'" class="grid grid-cols-3 gap-3">
          <div class="grid gap-1.5">
            <Label>副标题</Label>
            <Input v-model="form.subtitle" :disabled="readonly" />
          </div>
          <div class="grid gap-1.5">
            <Label>排序</Label>
            <Input v-model="form.sort" :disabled="readonly" />
          </div>
          <div class="grid gap-1.5">
            <Label>分组</Label>
            <Input v-model="form.groupName" maxlength="64" :disabled="readonly" />
          </div>
        </div>
        <div class="grid gap-1.5">
          <Label>备注</Label>
          <Textarea v-model="form.remark" :disabled="readonly" maxlength="1024" />
        </div>
        <div class="grid gap-1.5">
          <Label>封面</Label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(url, index) in form.coverUrls"
              :key="url + index"
              type="button"
              class="relative"
              :disabled="readonly"
              @click="!readonly && removeCover(index)"
            >
              <img :src="url" class="h-16 w-16 rounded-md border object-cover" alt="封面" />
            </button>
          </div>
          <ImageUploader
            v-if="!readonly"
            compact
            clear-after-crop
            title="上传封面"
            :disabled="uploading"
            @image-cropped="onCoverCropped"
          />
          <span v-if="!readonly" class="text-xs text-muted-foreground">
            {{ uploading ? '封面上传中...' : '点击已上传封面可移除' }}
          </span>
        </div>
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">关闭</Button>
        <Button v-if="!readonly" :disabled="submitting || uploading" @click="onSubmit">
          {{ submitting ? '保存中...' : '保存' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchGiftCodeList, GiftCodeStatus, voidGiftCode, type GiftCode } from '@/api/gift-code'
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
import PaginationBar from '@/components/ui/pagination/PaginationBar.vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime, giftCodeStatusLabel } from '@/utils/labels'

const props = defineProps<{
  open: boolean
  goodsId?: string
  goodsName?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const loading = ref(false)
const errorMessage = ref('')
const rows = ref<GiftCode[]>([])
const page = ref(1)
const pageSize = 10
const total = ref(0)

/**
 * 加载指定商品的兑换码。
 */
async function loadList() {
  if (!props.goodsId) {
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await fetchGiftCodeList({
      goodsId: props.goodsId,
      page: page.value,
      pageSize,
    })
    rows.value = result.rows
    total.value = result.total
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.goodsId] as const,
  () => {
    if (props.open) {
      page.value = 1
      void loadList()
    }
  },
)

/**
 * 切换页码并重新加载。
 *
 * @param next 目标页码
 */
function onPageChange(next: number) {
  if (props.open) {
    page.value = next
    void loadList()
  }
}

/**
 * 作废兑换码。
 *
 * @param item 行数据
 */
async function onVoid(item: GiftCode) {
  if (!window.confirm(`确认作废兑换码「${item.code}」？`)) {
    return
  }
  try {
    await voidGiftCode(item.id)
    await loadList()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <DialogTitle>兑换码列表</DialogTitle>
        <DialogDescription>
          {{ goodsName }}（{{ goodsId }}）
        </DialogDescription>
      </DialogHeader>
      <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>兑换码</TableHead>
            <TableHead>订单号</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="!loading && rows.length === 0">
            <TableCell colspan="5" class="text-center text-muted-foreground">暂无数据</TableCell>
          </TableRow>
          <TableRow v-for="item in rows" :key="item.id">
            <TableCell>{{ item.code }}</TableCell>
            <TableCell>{{ item.orderNo || '-' }}</TableCell>
            <TableCell>{{ giftCodeStatusLabel(item.status) }}</TableCell>
            <TableCell>{{ formatDateTime(item.createdAt) }}</TableCell>
            <TableCell>
              <Button
                size="xs"
                variant="destructive"
                :disabled="item.status === GiftCodeStatus.Voided"
                @click="onVoid(item)"
              >
                作废
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <PaginationBar
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="onPageChange"
      />
      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

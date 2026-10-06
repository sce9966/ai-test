<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchGiftCode, fetchGiftCodeList, voidGiftCode, type GiftCode } from '@/api/gift-code'
import { getApiErrorMessage } from '@/api/http'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import PaginationBar from '@/components/ui/pagination/PaginationBar.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateTime, giftCodeStatusLabel, virtualGoodsKindLabel } from '@/utils/labels'

const loading = ref(false)
const errorMessage = ref('')
const rows = ref<GiftCode[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const code = ref('')
const goodsName = ref('')
const orderNo = ref('')
const status = ref('all')

const detailOpen = ref(false)
const detail = ref<GiftCode | null>(null)

/**
 * 加载兑换码列表。
 */
async function loadList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await fetchGiftCodeList({
      page: page.value,
      pageSize,
      code: code.value.trim() || undefined,
      goodsName: goodsName.value.trim() || undefined,
      orderNo: orderNo.value.trim() || undefined,
      status: status.value === 'all' ? undefined : Number(status.value),
    })
    rows.value = result.rows
    total.value = result.total
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  } finally {
    loading.value = false
  }
}

/**
 * 查询并回到第一页。
 */
function onSearch() {
  page.value = 1
  void loadList()
}

/**
 * 打开详情。
 *
 * @param item 行数据
 */
async function onDetail(item: GiftCode) {
  try {
    detail.value = await fetchGiftCode(item.id)
    detailOpen.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
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

/**
 * 切换页码并重新加载。
 *
 * @param next 目标页码
 */
function onPageChange(next: number) {
  page.value = next
  void loadList()
}

onMounted(() => {
  void loadList()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">兑换码</span>
        <Input v-model="code" class="w-40" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">商品名称</span>
        <Input v-model="goodsName" class="w-40" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">订单号</span>
        <Input v-model="orderNo" class="w-40" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">状态</span>
        <Select v-model="status">
          <SelectTrigger class="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="0">未使用</SelectItem>
            <SelectItem value="1">已绑定</SelectItem>
            <SelectItem value="2">已作废</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button @click="onSearch">查询</Button>
    </div>

    <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>兑换码</TableHead>
          <TableHead>商品类型</TableHead>
          <TableHead>商品名称</TableHead>
          <TableHead>订单号</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!loading && rows.length === 0">
          <TableCell colspan="6" class="text-center text-muted-foreground">暂无数据</TableCell>
        </TableRow>
        <TableRow v-for="item in rows" :key="item.id">
          <TableCell>{{ item.code }}</TableCell>
          <TableCell>{{ virtualGoodsKindLabel(item.goodsKind) }}</TableCell>
          <TableCell>{{ item.goodsName || '-' }}</TableCell>
          <TableCell>{{ item.orderNo || '-' }}</TableCell>
          <TableCell>{{ giftCodeStatusLabel(item.status) }}</TableCell>
          <TableCell>
            <div class="flex gap-1">
              <Button size="xs" variant="ghost" @click="onDetail(item)">详情</Button>
              <Button
                size="xs"
                variant="destructive"
                :disabled="item.status === 2"
                @click="onVoid(item)"
              >
                作废
              </Button>
            </div>
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

    <Dialog :open="detailOpen" @update:open="detailOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>兑换码详情</DialogTitle>
        </DialogHeader>
        <div v-if="detail" class="grid gap-2 text-sm">
          <p>兑换码：{{ detail.code }}</p>
          <p>商品ID：{{ detail.goodsId }}</p>
          <p>商品类型：{{ virtualGoodsKindLabel(detail.goodsKind) }}</p>
          <p>商品名称：{{ detail.goodsName || '-' }}</p>
          <p>订单号：{{ detail.orderNo || '-' }}</p>
          <p>状态：{{ giftCodeStatusLabel(detail.status) }}</p>
          <p>创建人：{{ detail.createdByName || '-' }}</p>
          <p>创建时间：{{ formatDateTime(detail.createdAt) }}</p>
          <p>更新人：{{ detail.updatedByName || '-' }}</p>
          <p>更新时间：{{ formatDateTime(detail.updatedAt) }}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="detailOpen = false">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

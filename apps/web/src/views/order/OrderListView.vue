<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getApiErrorMessage } from '@/api/http'
import { fetchOrderList, type Order } from '@/api/order'
import { Button } from '@/components/ui/button'
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
import { formatDateTime, orderStatusLabel, payStatusLabel } from '@/utils/labels'

const loading = ref(false)
const errorMessage = ref('')
const rows = ref<Order[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const orderNo = ref('')
const goodsName = ref('')
const userName = ref('')
const payStatus = ref('all')
const orderStatus = ref('all')

/**
 * 加载订单列表。
 */
async function loadList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await fetchOrderList({
      page: page.value,
      pageSize,
      orderNo: orderNo.value.trim() || undefined,
      goodsName: goodsName.value.trim() || undefined,
      userName: userName.value.trim() || undefined,
      payStatus: payStatus.value === 'all' ? undefined : Number(payStatus.value),
      orderStatus: orderStatus.value === 'all' ? undefined : Number(orderStatus.value),
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
        <span class="text-xs text-muted-foreground">付款单号</span>
        <Input v-model="orderNo" class="w-44" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">商品名称</span>
        <Input v-model="goodsName" class="w-36" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">用户名称</span>
        <Input v-model="userName" class="w-36" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">支付状态</span>
        <Select v-model="payStatus">
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="0">未支付</SelectItem>
            <SelectItem value="1">支付成功</SelectItem>
            <SelectItem value="2">支付失败</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">订单状态</span>
        <Select v-model="orderStatus">
          <SelectTrigger class="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="0">正常</SelectItem>
            <SelectItem value="1">完结</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button @click="onSearch">查询</Button>
    </div>

    <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>付款单号</TableHead>
          <TableHead>商品名称</TableHead>
          <TableHead>用户名称</TableHead>
          <TableHead>金额</TableHead>
          <TableHead>支付状态</TableHead>
          <TableHead>订单状态</TableHead>
          <TableHead>创建人</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>更新人</TableHead>
          <TableHead>更新时间</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!loading && rows.length === 0">
          <TableCell colspan="10" class="text-center text-muted-foreground">暂无数据</TableCell>
        </TableRow>
        <TableRow v-for="item in rows" :key="item.id">
          <TableCell>{{ item.orderNo }}</TableCell>
          <TableCell>{{ item.goodsName }}</TableCell>
          <TableCell>{{ item.userName }}</TableCell>
          <TableCell>{{ item.amount }}</TableCell>
          <TableCell>{{ payStatusLabel(item.payStatus) }}</TableCell>
          <TableCell>{{ orderStatusLabel(item.orderStatus) }}</TableCell>
          <TableCell>{{ item.createdByName || '-' }}</TableCell>
          <TableCell>{{ formatDateTime(item.createdAt) }}</TableCell>
          <TableCell>{{ item.updatedByName || '-' }}</TableCell>
          <TableCell>{{ formatDateTime(item.updatedAt) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <PaginationBar
      :page="page"
      :page-size="pageSize"
      :total="total"
      @update:page="onPageChange"
    />
  </div>
</template>

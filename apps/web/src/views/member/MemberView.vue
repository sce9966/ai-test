<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getApiErrorMessage } from '@/api/http'
import { deleteVirtualGoods, fetchVirtualGoodsList, type VirtualGoods } from '@/api/virtual-goods'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PaginationBar from '@/components/ui/pagination/PaginationBar.vue'
import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import GiftCodeListDialog from '@/components/virtual-goods/GiftCodeListDialog.vue'
import VirtualGoodsFormDialog from '@/components/virtual-goods/VirtualGoodsFormDialog.vue'
import { formatDateTime, shelfStatusLabel } from '@/utils/labels'

const loading = ref(false)
const errorMessage = ref('')
const rows = ref<VirtualGoods[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const name = ref('')
const goodsId = ref('')
const status = ref<string>('')

const formOpen = ref(false)
const formMode = ref<'create' | 'edit' | 'detail'>('create')
const current = ref<VirtualGoods | null>(null)
const codeOpen = ref(false)

/**
 * 加载会员列表。
 */
async function loadList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await fetchVirtualGoodsList({
      kind: 'member',
      page: page.value,
      pageSize,
      name: name.value.trim() || undefined,
      goodsId: goodsId.value.trim() || undefined,
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
 * 打开新增弹窗。
 */
function onCreate() {
  current.value = null
  formMode.value = 'create'
  formOpen.value = true
}

/**
 * 打开编辑 / 详情弹窗。
 *
 * @param item 行数据
 * @param mode 模式
 */
function onOpenForm(item: VirtualGoods, mode: 'edit' | 'detail') {
  current.value = item
  formMode.value = mode
  formOpen.value = true
}

/**
 * 删除会员商品。
 *
 * @param item 行数据
 */
async function onDelete(item: VirtualGoods) {
  if (!window.confirm(`确认删除会员「${item.name}」？`)) {
    return
  }
  try {
    await deleteVirtualGoods(item.id)
    await loadList()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error)
  }
}

/**
 * 查看兑换码列表。
 *
 * @param item 行数据
 */
function onViewCodes(item: VirtualGoods) {
  current.value = item
  codeOpen.value = true
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
        <span class="text-xs text-muted-foreground">商品ID</span>
        <Input v-model="goodsId" class="w-48" placeholder="精确匹配" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">会员名称</span>
        <Input v-model="name" class="w-40" placeholder="模糊查询" />
      </div>
      <div class="grid gap-1.5">
        <span class="text-xs text-muted-foreground">状态</span>
        <Select v-model="status">
          <SelectTrigger class="w-28">
            <SelectValue placeholder="全部" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectLabel>全部状态</SelectLabel>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="1">上架</SelectItem>
              <SelectItem value="0">下架</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button @click="onSearch">查询</Button>
      <Button variant="outline" @click="onCreate">新增</Button>
    </div>

    <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>商品ID</TableHead>
          <TableHead>会员名称</TableHead>
          <TableHead>单价</TableHead>
          <TableHead>划线价</TableHead>
          <TableHead>时长</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建人</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>更新人</TableHead>
          <TableHead>更新时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!loading && rows.length === 0">
          <TableCell colspan="11" class="text-center text-muted-foreground">暂无数据</TableCell>
        </TableRow>
        <TableRow v-for="item in rows" :key="item.id">
          <TableCell>{{ item.goodsId }}</TableCell>
          <TableCell>{{ item.name }}</TableCell>
          <TableCell>{{ item.price }}</TableCell>
          <TableCell>{{ item.linePrice }}</TableCell>
          <TableCell>{{ item.durationDays }}天</TableCell>
          <TableCell>{{ shelfStatusLabel(item.status) }}</TableCell>
          <TableCell>{{ item.createdByName || '-' }}</TableCell>
          <TableCell>{{ formatDateTime(item.createdAt) }}</TableCell>
          <TableCell>{{ item.updatedByName || '-' }}</TableCell>
          <TableCell>{{ formatDateTime(item.updatedAt) }}</TableCell>
          <TableCell>
            <div class="flex flex-wrap gap-1">
              <Button size="xs" variant="ghost" @click="onOpenForm(item, 'detail')">详情</Button>
              <Button size="xs" variant="ghost" @click="onOpenForm(item, 'edit')">编辑</Button>
              <Button size="xs" variant="ghost" @click="onViewCodes(item)">兑换码</Button>
              <Button size="xs" variant="destructive" @click="onDelete(item)">删除</Button>
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

    <VirtualGoodsFormDialog
      :open="formOpen"
      kind="member"
      :mode="formMode"
      :goods="current"
      @update:open="formOpen = $event"
      @saved="loadList"
    />
    <GiftCodeListDialog
      :open="codeOpen"
      :goods-id="current?.goodsId"
      :goods-name="current?.name"
      @update:open="codeOpen = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/**
 * 面包屑单项：由路由 matched 的 meta.title 推导。
 */
interface Crumb {
  title: string
  to?: string
  isCurrent: boolean
}

const route = useRoute()

/**
 * 根据当前匹配路由生成面包屑（跳过无 title 的布局路由）。
 */
const crumbs = computed<Crumb[]>(() => {
  const items: Crumb[] = []

  for (const record of route.matched) {
    const title = typeof record.meta.title === 'string' ? record.meta.title : undefined
    if (!title) {
      continue
    }

    items.push({
      title,
      to: record.path || '/',
      isCurrent: false,
    })
  }

  if (items.length === 0) {
    return [{ title: '首页', to: '/', isCurrent: true }]
  }

  return items.map((item, index) => ({
    ...item,
    isCurrent: index === items.length - 1,
    to: index === items.length - 1 ? undefined : item.to,
  }))
})
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(crumb, index) in crumbs" :key="`${crumb.title}-${index}`">
        <BreadcrumbItem>
          <BreadcrumbPage v-if="crumb.isCurrent">
            {{ crumb.title }}
          </BreadcrumbPage>
          <BreadcrumbLink v-else-if="crumb.to" as-child>
            <RouterLink :to="crumb.to">
              {{ crumb.title }}
            </RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < crumbs.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>

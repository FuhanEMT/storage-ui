<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-mark"></div>
      <span class="sidebar-logo-text">无何有境</span>
    </div>

    <n-menu :value="activeKey" key-field="_id" :options="menuList" :render-label="renderMenuLabel" />
  </aside>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { MenuOption } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/services/request'

const menuList = ref<MenuOption[]>([])
const router = useRouter()
const route = useRoute()
const userRole = computed(() => (useUserStore().userInfo?.role as string) ?? '')

const normalizeMenuTree = (items: any[], parentKey = 'root'): MenuOption[] =>
  items.map((item, index) => {
    const next: Record<string, any> = { ...item }
    // 强制每个菜单节点有唯一 _id，避免 key 冲突导致联动展开/选中
    next._id = String(item?._id ?? `${parentKey}-${index}-${item?.menu_path ?? 'node'}`)
    if (Array.isArray(item.children) && item.children.length > 0) {
      next.children = normalizeMenuTree(item.children, next._id)
    } else {
      delete next.children
    }
    return next as MenuOption
  })

const findMenuKeyByPath = (items: any[], path: string): string | null => {
  for (const item of items) {
    if (item?.menu_path === path) return String(item?._id ?? '')
    if (Array.isArray(item?.children)) {
      const childKey = findMenuKeyByPath(item.children, path)
      if (childKey) return childKey
    }
  }
  return null
}

const activeKey = computed(() => findMenuKeyByPath(menuList.value, route.path))

onMounted(async () => {
  const res = await request.get('/admin/menu/list')
  const list = Array.isArray(res?.data) ? res.data : []
  const role = userRole.value
  const filtered = list
    .filter((item: any) => !item.permission?.length || item.permission.includes(role))
    .sort((a: any, b: any) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
  menuList.value = normalizeMenuTree(filtered)
})

// 返回渲染名称
const renderMenuLabel = (options: MenuOption) => {
  if ('menu_path' in options) {
    const item = options as Record<string, unknown>
    const path = typeof item.menu_path === 'string' ? item.menu_path : ''
    return h(
      'div',
      { onClick: () => path && router.push(path), style: { color: '#c4cdef' } },
      String(item.menu_name ?? '')
    )
  }
  return String((options as Record<string, unknown>).menu_name ?? '')
}

</script>

<style scoped>
.sidebar {
  width: 220px;
  padding: 20px 18px;
  border-right: 1px solid rgba(123, 167, 255, 0.25);
  background: linear-gradient(160deg, rgba(8, 11, 30, 0.96), rgba(6, 9, 24, 0.96));
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #ff9ad8, #9bb5ff, #b0ffea, #ff9ad8);
  box-shadow:
    0 0 14px rgba(255, 154, 216, 0.7),
    0 0 22px rgba(155, 181, 255, 0.8);
}

.sidebar-logo-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.menu-item {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #c4cdef;
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.08s ease;
}

.menu-item .menu-icon {
  font-size: 15px;
}

.menu-item.is-active {
  background: linear-gradient(135deg, rgba(255, 154, 216, 0.35), rgba(155, 181, 255, 0.4));
  color: #101322;
  font-weight: 600;
}

.menu-item:not(.is-active):hover {
  background: rgba(34, 44, 82, 0.9);
  transform: translateX(1px);
}

@media (max-width: 960px) {
  .sidebar {
    display: none;
  }
}
</style>

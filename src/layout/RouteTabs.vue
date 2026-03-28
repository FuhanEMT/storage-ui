<template>
  <div class="route-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.path"
      type="button"
      class="route-tab"
      :class="{ 'is-active': tab.path === route.path }"
      @click="goTab(tab.path)"
    >
      {{ tab.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/services/request'
import { useUserStore } from '@/stores/user'

type TabItem = {
  path: string
  title: string
}

const route = useRoute()
const router = useRouter()
const tabs = ref<TabItem[]>([])
const menuPathTitleMap = ref<Record<string, string>>({})
const userRole = computed(() => (useUserStore().userInfo?.role as string) ?? '')

const buildPathTitleMap = (items: any[]): Record<string, string> => {
  const out: Record<string, string> = {}
  const walk = (list: any[]) => {
    for (const item of list) {
      const p = typeof item?.menu_path === 'string' ? item.menu_path : ''
      const n = typeof item?.menu_name === 'string' ? item.menu_name : ''
      if (p && n) out[p] = n
      if (Array.isArray(item?.children) && item.children.length) walk(item.children)
    }
  }
  walk(items)
  return out
}

const toTitle = (path: string) => {
  if (menuPathTitleMap.value[path]) return menuPathTitleMap.value[path]
  const fallback = path.split('/').filter(Boolean).pop() || path
  return decodeURIComponent(fallback)
}

const ensureCurrentTab = (path: string) => {
  const idx = tabs.value.findIndex((x) => x.path === path)
  if (idx >= 0) return
  tabs.value.push({ path, title: toTitle(path) })
}

const goTab = (path: string) => {
  if (path !== route.path) router.push(path)
}

onMounted(async () => {
  try {
    const res = await request.get('/admin/menu/list')
    const list = Array.isArray(res?.data) ? res.data : []
    const role = userRole.value
    const filtered = list
      .filter((item: any) => !item.permission?.length || item.permission.includes(role))
      .sort((a: any, b: any) => (a.menu_order ?? 0) - (b.menu_order ?? 0))
    menuPathTitleMap.value = buildPathTitleMap(filtered)
    tabs.value = tabs.value.map((t) => ({ ...t, title: toTitle(t.path) }))
  } catch {
    // ignore
  }
})

ensureCurrentTab(route.path)

watch(
  () => route.path,
  (path) => {
    ensureCurrentTab(path)
  },
)
</script>

<style scoped>
.route-tabs {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 0;
  margin: -2px 0 10px;
  border-bottom: 1px solid rgba(123, 167, 255, 0.28);
  padding-bottom: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.route-tabs::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.route-tab {
  border: 1px solid rgba(123, 167, 255, 0.28);
  border-bottom: 0;
  background: linear-gradient(180deg, rgba(18, 24, 52, 0.9), rgba(13, 19, 42, 0.88));
  color: #c9d7ff;
  padding: 6px 12px 7px;
  border-radius: 10px 10px 0 0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: -1px;
  white-space: nowrap;
  position: relative;
  top: 1px;
}

.route-tab:hover {
  color: #fff;
  border-color: rgba(170, 205, 255, 0.62);
  background: linear-gradient(180deg, rgba(30, 40, 80, 0.95), rgba(18, 26, 56, 0.92));
}

.route-tab.is-active {
  color: #101322;
  border-color: rgba(200, 214, 255, 0.88);
  background: linear-gradient(135deg, rgba(255, 164, 221, 0.93), rgba(158, 186, 255, 0.95));
  font-weight: 600;
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.16) inset;
  top: 0;
  z-index: 1;
}
</style>


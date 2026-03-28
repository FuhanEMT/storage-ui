<template>
  <section class="online-websites-page">
    <header class="ow-header">
      <h2 class="ow-title">在线网站</h2>
      <div class="ow-desc-row">
        <p class="ow-desc">在线网站，可点击进行在线浏览，相当于一个小型的浏览器（也会有一些网站其本身会拒绝我们进行私下打开，所以这里只提供一个方便的浏览方式）</p>
        <n-button type="primary" size="small" @click="openBrowserModal">打开浏览</n-button>
      </div>
    </header>

    <div class="ow-browser-panel">
      <div v-if="tabs.length" class="ow-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="ow-tab"
          :class="{ 'is-active': tab.id === activeTabId }"
          @click="activeTabId = tab.id"
        >
          <span class="ow-tab-text">{{ tab.title }}</span>
          <span class="ow-tab-close" @click.stop="closeTab(tab.id)">×</span>
        </button>
      </div>
      <div v-if="activeTab" class="ow-iframe-wrap">
        <iframe :src="activeTab.link" frameborder="0" class="ow-iframe" />
      </div>
      <div v-else class="ow-browser-empty">请选择一个网址开始在线浏览</div>
    </div>
    <n-modal
      v-model:show="browserModalVisible"
      preset="card"
      title="选择分组"
      style="width: min(960px, 94vw)"
    >
      <div class="ow-modal-body">
        <n-spin :show="isLoading">
          <div v-if="!isLoading && !groups.length" class="ow-empty">暂无可浏览的收藏网址</div>
          <div v-else class="ow-groups">
            <section
              v-for="group in groups"
              :key="group._id || group.name"
              class="ow-group-card"
              :style="cardBgStyle(group.bgImages)"
              @click="openGroupDetail(group)"
            >
              <h3 class="ow-group-title">{{ group.name || '未命名分组' }}</h3>
              <p class="ow-group-desc">{{ group.description || ' ' }}</p>
              <div class="ow-group-count">网址数量：{{ group.addreamUrl.length }}</div>
            </section>
          </div>
        </n-spin>
      </div>
    </n-modal>

    <n-modal
      v-model:show="groupDetailVisible"
      preset="card"
      :title="selectedGroup?.name || '分组网址'"
      style="width: min(920px, 92vw)"
    >
      <div class="ow-modal-body">
        <div v-if="!selectedGroup?.addreamUrl?.length" class="ow-empty">该分组暂无网址</div>
        <div v-else class="ow-url-grid">
          <button
            v-for="(item, idx) in selectedGroup?.addreamUrl || []"
            :key="item._id || `${item.link}-${idx}`"
            class="ow-url-tile"
            type="button"
            :title="item.title || item.link"
            @click="openWebsiteTab(item)"
          >
            <img v-if="item.icon" class="ow-url-icon" :src="toImageUrl(item.icon)" alt="" />
            <span v-else class="ow-url-icon ow-url-icon--placeholder" />
            <span class="ow-url-name">{{ item.title || item.link }}</span>
          </button>
        </div>
      </div>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import request from '@/services/request'

// ===== types =====
type BookmarkUrl = {
  _id?: string
  title?: string
  link?: string
  icon?: string
}

type BookmarkGroup = {
  _id?: string
  name?: string
  description?: string
  bgImages?: string
  addreamUrl: BookmarkUrl[]
}

type BrowserTab = {
  id: string
  title: string
  link: string
}

// ===== state =====
const message = useMessage()
const browserModalVisible = ref(false)
const groupDetailVisible = ref(false)
const isLoading = ref(false)
const groups = ref<BookmarkGroup[]>([])
const selectedGroup = ref<BookmarkGroup | null>(null)
const tabs = ref<BrowserTab[]>([])
const activeTabId = ref('')
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const activeTab = computed(() => tabs.value.find((x) => x.id === activeTabId.value) || null)

// ===== helpers =====
const toText = (val: unknown) => (val == null ? '' : String(val))
const toImageUrl = (val: string) => (val.startsWith('http') ? val : `${apiBase}${val}`)
const isColor = (val: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)

const cardBgStyle = (bg: string | undefined) => {
  const val = toText(bg).trim()
  if (!val) return {}
  if (isColor(val)) return { background: val }
  if (val.startsWith('/')) return { backgroundImage: `url(${toImageUrl(val)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (val.startsWith('http')) return { backgroundImage: `url(${val})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
}

const mapUrl = (item: any): BookmarkUrl => ({
  _id: toText(item?._id),
  title: toText(item?.title),
  link: toText(item?.link),
  icon: toText(item?.icon),
})

const mapGroup = (raw: any): BookmarkGroup => ({
  _id: toText(raw?._id),
  name: toText(raw?.name),
  description: toText(raw?.description),
  bgImages: toText(raw?.bgImages),
  addreamUrl: Array.isArray(raw?.addreamUrl)
    ? raw.addreamUrl
      .filter((item: any) => item?.link)
      .map((item: any) => mapUrl(item))
    : [],
})

// ===== api =====
const fetchBookmarkGroups = async () => {
  isLoading.value = true
  try {
    const res = (await request.get('/admin/bookmark/group')) as any
    const list = Array.isArray(res?.data) ? res.data : []
    groups.value = list.map((item: any) => mapGroup(item))
  } catch (error: any) {
    message.error(error?.message || '获取收藏网址失败')
  } finally {
    isLoading.value = false
  }
}

// ===== handlers =====
const openBrowserModal = async () => {
  browserModalVisible.value = true
  await fetchBookmarkGroups()
}

const openGroupDetail = (group: BookmarkGroup) => {
  selectedGroup.value = group
  groupDetailVisible.value = true
}

const openWebsiteTab = (item: BookmarkUrl) => {
  const link = toText(item.link).trim()
  if (!link) return
  const title = toText(item.title || link)
  const existing = tabs.value.find((x) => x.link === link)
  if (existing) {
    activeTabId.value = existing.id
    return
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  tabs.value.push({ id, title, link })
  activeTabId.value = id
}

const closeTab = (id: string) => {
  const index = tabs.value.findIndex((x) => x.id === id)
  if (index < 0) return
  const isActive = activeTabId.value === id
  tabs.value.splice(index, 1)
  if (!tabs.value.length) {
    activeTabId.value = ''
    return
  }
  if (isActive) {
    const next = tabs.value[Math.max(0, index - 1)] || tabs.value[0]
    activeTabId.value = next ? next.id : ''
  }
}
</script>

<style scoped>
.online-websites-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  box-sizing: border-box;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(14, 20, 42, 0.72), rgba(10, 14, 32, 0.66));
  border: 1px solid rgba(123, 167, 255, 0.18);
}

.ow-header {
  margin-bottom: 2px;
}

.ow-desc-row {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ow-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.ow-desc {
  margin: 0;
  font-size: 13px;
  color: #8f9bc2;
}

.ow-browser-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(123, 167, 255, 0.2);
  background: rgba(13, 19, 41, 0.78);
}

.ow-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  border-bottom: 1px solid rgba(123, 167, 255, 0.2);
  background: rgba(7, 10, 26, 0.66);
}

.ow-tab {
  max-width: 240px;
  height: 34px;
  border: none;
  border-right: 1px solid rgba(123, 167, 255, 0.18);
  background: transparent;
  color: #9fb0dd;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  cursor: pointer;
}

.ow-tab.is-active {
  color: #e8efff;
  background: linear-gradient(180deg, rgba(43, 65, 128, 0.42), rgba(24, 36, 74, 0.26));
}

.ow-tab-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
}

.ow-tab-close {
  font-size: 14px;
  line-height: 1;
  color: #b8c8ef;
}

.ow-tab-close:hover {
  color: #fff;
}

.ow-iframe-wrap {
  flex: 1;
  min-height: 420px;
}

.ow-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.ow-browser-empty {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8f9bc2;
  font-size: 13px;
}

.ow-modal-body {
  max-height: 68vh;
  overflow: auto;
}

.ow-empty {
  padding: 18px 12px;
  text-align: center;
  color: #8f9bc2;
}

.ow-groups {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.ow-group-card {
  position: relative;
  padding: 12px;
  border-radius: 10px;
  min-height: 112px;
  background: rgba(10, 14, 38, 0.96);
  border: none;
  box-shadow:
    0 8px 16px rgba(255, 255, 255, 0.11),
    0 2px 8px rgba(255, 255, 255, 0.06);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ow-group-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.88) 0%,
    rgba(0, 0, 0, 0.66) 30%,
    rgba(0, 0, 0, 0.36) 58%,
    rgba(0, 0, 0, 0.06) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.ow-group-card > * {
  position: relative;
  z-index: 1;
}

.ow-group-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 20px rgba(255, 255, 255, 0.16),
    0 3px 10px rgba(255, 255, 255, 0.08);
}

.ow-group-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.ow-group-desc {
  margin: 0 0 8px;
  font-size: 12px;
  color: #91a0cb;
}

.ow-group-count {
  font-size: 11px;
  color: #d6e2ff;
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(155, 181, 255, 0.16);
}

.ow-url-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.ow-url-tile {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(20, 28, 56, 0.66);
  border: 1px solid rgba(123, 167, 255, 0.2);
  color: #dbe5ff;
  text-decoration: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
  transition: all 0.15s ease;
}

.ow-url-tile:hover {
  border-color: rgba(160, 195, 255, 0.55);
  background: rgba(28, 40, 78, 0.78);
  transform: translateY(-1px);
}

.ow-url-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.ow-url-icon--placeholder {
  background: rgba(176, 197, 255, 0.28);
}

.ow-url-name {
  min-width: 0;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1024px) {
  .ow-groups {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .ow-groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>


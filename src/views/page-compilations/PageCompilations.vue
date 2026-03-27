<template>
  <section class="page-compilations">
    <header class="pc-header">
      <div class="pc-header-main">
        <div>
          <h2 class="pc-title">网址收藏</h2>
          <p class="pc-desc">可自行分组创建管理，点击创建分组，分组后，可在组内创建对应的收藏网址操作</p>
        </div>
        <button class="pc-add-btn" @click="addGroup">新增分组</button>
      </div>
    </header>

    <div class="pc-grid">
      <article
        v-for="item in groups"
        :key="String(item._id || item.name)"
        class="pc-card"
        :style="cardBgStyle(item.bgImages)"
        @click="openGroupDetail(item, $event)"
      >
        <h3 class="pc-card-title">{{ item.name }}</h3>
        <p class="pc-card-desc">{{ item.description || ' ' }}</p>
        <div class="pc-chip-row">
          <span v-for="tag in item.tags" :key="tag" class="pc-chip">{{ tag }}</span>
        </div>
      </article>
    </div>

    <n-modal v-model:show="showModal" preset="card" draggable transform-origin="center" style="width: 420px;">
      <template #header>
        <div>新建分组</div>
      </template>
      <n-form label-placement="top" :model="formModel" class="pc-form">
        <n-form-item label="分组名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入分组名称" />
        </n-form-item>

        <n-form-item label="分组标签" path="tags">
          <n-select v-model:value="formModel.tags" :options="tagOptions" multiple filterable tag
            placeholder="输入后按回车可创建标签，也可下拉多选" />
        </n-form-item>

        <n-form-item label="分组背景" path="background">
          <div class="pc-bg-row">
            <n-input v-model:value="formModel.background" placeholder="请输入背景图片地址或颜色值，如 #1e293b" />
            <n-button class="pc-bg-upload" type="success" @click="onUploadBackground">上传</n-button>
          </div>
        </n-form-item>

        <n-form-item label="分组描述" path="description">
          <n-input v-model:value="formModel.description" type="textarea" rows="3" placeholder="请输入该分组的说明描述" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="pc-modal-footer">
          <n-button quaternary size="small" @click="onCancelCreate">取消</n-button>
          <n-button type="primary" size="small" @click="onSubmitCreate">确定</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 分组详情弹层：由卡片位置放大到弹框 -->
    <Teleport to="body">
      <div v-if="detailVisible" class="pc-detail-mask" @click="closeGroupDetail">
        <div class="pc-detail-panel" :style="[detailPanelStyle, detailBgStyle(detailItem?.bgImages)]" @click.stop>
          <div class="pc-detail-inner" :class="{ 'is-ready': detailReady }">
            <header class="pc-detail-header">
              <span class="pc-detail-title">{{ detailItem?.name }}</span>
              <button class="pc-detail-close" @click="closeGroupDetail">×</button>
            </header>

            <div class="pc-detail-actions">
              <n-button size="small" type="success" @click="openAddUrlModal">添加网址</n-button>
            </div>

            <div class="pc-url-grid">
              <a
                v-for="(item, idx) in detailItem?.addreamUrl || []"
                :key="`${item.link}-${idx}`"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="pc-url-tile"
                :title="item.title"
              >
                <img v-if="item.icon" class="pc-url-icon" :src="toImageUrl(item.icon)" alt="" />
                <span v-else class="pc-url-icon pc-url-icon--placeholder" />
                <span class="pc-url-name">{{ item.title }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 添加网址弹窗 -->
    <n-modal v-model:show="addUrlVisible" preset="card" transform-origin="center" style="width: 420px;">
      <template #header>
        <div>添加网址</div>
      </template>
      <n-form label-placement="top" :model="urlForm" class="pc-form">
        <n-form-item label="网址名称" path="title">
          <n-input v-model:value="urlForm.title" placeholder="必填" />
        </n-form-item>
        <n-form-item label="网址链接" path="link">
          <n-input v-model:value="urlForm.link" placeholder="必填，如 https://example.com" />
        </n-form-item>
        <n-form-item label="Icon 图标" path="icon">
          <div class="pc-bg-row">
            <n-input v-model:value="urlForm.icon" placeholder="可选：图片地址" />
            <n-button class="pc-bg-upload" type="success" @click="onUploadIcon">上传</n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="pc-modal-footer">
          <n-button quaternary size="small" @click="closeAddUrlModal">取消</n-button>
          <n-button type="primary" size="small" @click="onSubmitAddUrl">确认</n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NButton } from 'naive-ui'
import { openImageCropper } from '@/services/imageCropper'
import request from '@/services/request'
import { msg } from '@/plugins/message'

// 分组弹窗
const showModal = ref<boolean>(false)

type BookmarkGroup = {
  _id?: string
  name: string
  tags: string[]
  bgImages?: string
  description?: string
  addreamUrl?: Array<{ title: string; link: string; icon?: string; time?: string }>
}

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const groups = ref<BookmarkGroup[]>([])
const toImageUrl = (val: string) => (val.startsWith('http') ? val : apiBase + val)
const isColor = (val: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)
const cardBgStyle = (bg: string | undefined) => {
  const val = (bg ?? '').trim()
  if (!val) return {}
  if (isColor(val)) return { background: val }
  if (val.startsWith('/')) return { backgroundImage: `url(${toImageUrl(val)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (val.startsWith('http')) return { backgroundImage: `url(${val})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
}
const detailBgStyle = (bg: string | undefined) => {
  const val = (bg ?? '').trim()
  if (!val) return {}
  if (isColor(val)) return { background: val }
  if (val.startsWith('/')) return { backgroundImage: `url(${toImageUrl(val)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (val.startsWith('http')) return { backgroundImage: `url(${val})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
}

const fetchGroups = async () => {
  const res = (await request.get('/admin/bookmark/group')) as any
  const list = Array.isArray(res?.data) ? (res.data as BookmarkGroup[]) : []
  groups.value = list.map((x) => ({
    _id: (x as any)._id,
    name: String((x as any).name ?? ''),
    tags: Array.isArray((x as any).tags) ? (x as any).tags.map((t: any) => String(t)) : [],
    bgImages: (x as any).bgImages != null ? String((x as any).bgImages) : '',
    description: (x as any).description != null ? String((x as any).description) : '',
    addreamUrl: Array.isArray((x as any).addreamUrl)
      ? (x as any).addreamUrl.map((u: any) => ({
        title: String(u?.title ?? ''),
        link: String(u?.link ?? ''),
        icon: u?.icon != null ? String(u?.icon) : '',
        time: String(u?.time ?? ''),
      }))
      : [],
  }))
}

const detailVisible = ref(false)
const detailReady = ref(false)
const detailItem = ref<BookmarkGroup | null>(null)
const detailStartRect = reactive({ top: 0, left: 0, width: 0, height: 0 })
const detailRect = reactive({ top: 0, left: 0, width: 0, height: 0 })
const addUrlVisible = ref(false)
const urlForm = reactive({ title: '', link: '', icon: '' })

const detailPanelStyle = reactive({
  top: '0px',
  left: '0px',
  width: '0px',
  height: '0px',
})

const calcTargetRect = () => {
  const width = Math.min(760, window.innerWidth - 32)
  const height = Math.min(520, window.innerHeight - 40)
  return {
    width,
    height,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
  }
}

const applyRect = (rect: { top: number; left: number; width: number; height: number }) => {
  detailRect.top = rect.top
  detailRect.left = rect.left
  detailRect.width = rect.width
  detailRect.height = rect.height
  detailPanelStyle.top = `${rect.top}px`
  detailPanelStyle.left = `${rect.left}px`
  detailPanelStyle.width = `${rect.width}px`
  detailPanelStyle.height = `${rect.height}px`
}

const formModel = reactive({
  name: '',
  tags: [] as string[],
  background: '',
  description: ''
})

const tagOptions = [
  { label: '插画', value: '插画' },
  { label: '背景', value: '背景' },
  { label: '贴图', value: '贴图' },
  { label: '工具', value: '工具' },
  { label: '灵感', value: '灵感' }
]


const resetForm = () => {
  formModel.name = ''
  formModel.tags = []
  formModel.background = ''
  formModel.description = ''
}

const addGroup = () => {
  showModal.value = true
}

const onCancelCreate = () => {
  showModal.value = false
  resetForm()
}

watch(showModal, (v) => {
  // 点击遮罩/ESC 关闭时也要清空
  if (!v) resetForm()
})

const onSubmitCreate = async () => {
  // 这里暂时只做简单必填校验和关闭弹窗，可以在接入接口时再扩展
  if (!formModel.name.trim()) {
    // 如果项目里有全局 message，这里可以改成 message.warning
    return
  }
  try {
    await request.post('/admin/bookmark/group', {
      name: formModel.name,
      tags: formModel.tags,
      bgImages: formModel.background,
      description: formModel.description,
    })
    await fetchGroups()
    showModal.value = false
    resetForm()
  } catch {
    // ignore
  }
}

const onUploadBackground = async () => {
  try {
    const url = await openImageCropper({ title: '分组背景', shape: 'rect', aspectRatio: 16 / 10 })
    formModel.background = url
  } catch {
    // ignore
  }
}

const openGroupDetail = (item: BookmarkGroup, e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  detailStartRect.top = rect.top
  detailStartRect.left = rect.left
  detailStartRect.width = rect.width
  detailStartRect.height = rect.height
  applyRect(detailStartRect)
  detailItem.value = item
  detailVisible.value = true
  detailReady.value = false
  addUrlVisible.value = false
  resetUrlForm()
  requestAnimationFrame(() => {
    applyRect(calcTargetRect())
    detailReady.value = true
  })
}

const resetUrlForm = () => {
  urlForm.title = ''
  urlForm.link = ''
  urlForm.icon = ''
}

const openAddUrlModal = () => {
  addUrlVisible.value = true
}

const closeAddUrlModal = () => {
  addUrlVisible.value = false
  resetUrlForm()
}

const closeGroupDetail = () => {
  detailReady.value = false
  closeAddUrlModal()
  applyRect(detailStartRect)
  window.setTimeout(() => {
    detailVisible.value = false
    detailItem.value = null
  }, 260)
}

const onUploadIcon = async () => {
  try {
    const url = await openImageCropper({ title: 'Icon 图标', shape: 'circle' })
    urlForm.icon = url
  } catch {
    // ignore
  }
}

const onSubmitAddUrl = async () => {
  const id = detailItem.value?._id
  if (!id) return
  if (!urlForm.title.trim()) {
    msg.warning('网址名称必填')
    return
  }
  if (!urlForm.link.trim()) {
    msg.warning('网址链接必填')
    return
  }
  try {
    await request.post(`/admin/bookmark/group/${id}/url`, {
      title: urlForm.title,
      link: urlForm.link,
      icon: urlForm.icon,
    })
    await fetchGroups()
    detailItem.value = groups.value.find((g) => g._id === id) || null
    closeAddUrlModal()
  } catch {
    // ignore
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.page-compilations {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pc-header {
  margin-bottom: 2px;
}

.pc-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pc-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.pc-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8f9bc2;
}

.pc-add-btn {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(155, 181, 255, 0.7);
  background: radial-gradient(circle at 0 0, rgba(255, 154, 216, 0.3), rgba(10, 14, 38, 0.96));
  color: #e8ecff;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(155, 181, 255, 0.3);
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.08s ease;
}

.pc-add-btn:hover {
  background: radial-gradient(circle at 0 0, rgba(255, 154, 216, 0.45), rgba(10, 14, 38, 0.98));
  box-shadow: 0 0 22px rgba(155, 181, 255, 0.5);
  transform: translateY(-1px);
}

.pc-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.pc-card {
  position: relative;
  border-radius: 10px;
  padding: 14px 16px;
  background: rgba(10, 14, 38, 0.96);
  border: 1px solid rgba(123, 167, 255, 0.35);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.65);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.pc-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.72);
}

/* 背景变暗：即使白图也保证文字可读 */
.pc-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 18, 0.55);
  pointer-events: none;
  z-index: 0;
}

.pc-card > * {
  position: relative;
  z-index: 1;
}

.pc-card-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.pc-card-desc {
  margin: 0 0 10px;
  font-size: 12px;
  color: #a7b4d8;
}

.pc-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pc-chip-row--modal {
  margin: -4px 0 10px;
}

.pc-chip {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(155, 181, 255, 0.16);
  color: #d9e3ff;
}

.pc-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pc-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pc-bg-row {
  width: 100%;
  display: flex;
  gap: 0;
  align-items: stretch;
}

.pc-bg-row :deep(.n-input) {
  flex: 1;
}

.pc-bg-upload {
  height: 34px;
  margin-left: 8px;
}

.pc-detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 2000;
}

.pc-detail-panel {
  position: fixed;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(10, 14, 38, 0.98);
  border: 1px solid rgba(123, 167, 255, 0.35);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.72);
  transition: top 0.26s ease, left 0.26s ease, width 0.26s ease, height 0.26s ease;
  background-size: cover;
  background-position: center;
}

.pc-detail-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 18, 0.58);
  z-index: 0;
  pointer-events: none;
}

.pc-detail-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #fff;
}

.pc-detail-inner.is-ready {
  opacity: 1;
}

.pc-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pc-detail-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.pc-detail-close {
  border: 0;
  background: transparent;
  color: #d9e3ff;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.pc-detail-desc {
  margin: 0;
  font-size: 13px;
  color: #a7b4d8;
}

.pc-detail-actions {
  display: flex;
  gap: 8px;
}

.pc-url-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(19, 25, 56, 0.7);
}

.pc-url-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pc-url-grid {
  margin-top: 4px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.pc-url-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-decoration: none;
  background: rgba(155, 181, 255, 0.14);
  border: 1px solid rgba(155, 181, 255, 0.24);
  border-radius: 10px;
  padding: 10px 10px;
  min-width: 0;
  transition: background 0.15s ease, transform 0.12s ease;
}

.pc-url-tile:hover {
  background: rgba(155, 181, 255, 0.22);
  transform: translateY(-1px);
}

.pc-url-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 auto;
}

.pc-url-icon--placeholder {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.pc-url-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 960px) {
  .pc-url-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .pc-url-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .pc-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .pc-grid {
    grid-template-columns: 1fr;
  }
}

</style>

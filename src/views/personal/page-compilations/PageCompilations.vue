<template>
  <section class="page-compilations">
    <header class="pc-header">
      <div class="pc-header-main">
        <div>
          <h2 class="pc-title">网址收藏</h2>
          <p class="pc-desc">可自行分组创建管理，点击创建分组，分组后，可在组内创建对应的收藏网址操作</p>
        </div>
        <div>
          <button class="pc-add-btn" @click="addGroup" style="margin-right: 10px;">新增分组</button>
          <button class="pc-add-btn" @click="handleAddUploadGroup">批量新增分组</button>
          <input
            ref="bookmarkFileInputRef"
            type="file"
            accept=".html,text/html"
            class="pc-hidden-file-input"
            @change="onBookmarkFileChange"
          />
        </div>
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
        <button
          class="pc-card-edit pc-card-action"
          type="button"
          title="编辑分组"
          @click.stop="onEditGroup(item)"
        >
          ✎
        </button>
        <button
          class="pc-card-delete pc-card-action"
          type="button"
          title="删除分组"
          @click.stop="onDeleteGroup(item)"
        >
          🗑
        </button>
        <h3 class="pc-card-title">{{ item.name }}</h3>
        <p class="pc-card-desc">{{ item.description || ' ' }}</p>
        <div class="pc-chip-row">
          <span v-for="tag in item.tags" :key="tag" class="pc-chip">{{ tag }}</span>
        </div>
      </article>
    </div>

    <n-modal v-model:show="showModal" preset="card" draggable transform-origin="center" style="width: 420px;">
      <template #header>
        <div>{{ editingGroupId ? '编辑分组' : '新建分组' }}</div>
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
              <n-button size="small" type="success" @click="openAddUrlModal">+</n-button>
              <template v-if="!urlDeleteMode">
                <n-button class="pc-action-icon-btn" type="error" size="small"  @click="openUrlDeleteMode">✕</n-button>
              </template>
              <template v-else>
                <n-button type="error" size="small" @click="cancelUrlDeleteMode">取消</n-button>
                <n-button size="small" type="error" :disabled="!selectedUrlKeys.length" @click="confirmDeleteSelectedUrls">
                  删除
                </n-button>
              </template>
            </div>

            <div class="pc-url-grid">
              <component
                v-for="(item, idx) in detailItem?.addreamUrl || []"
                :key="`${item.link}-${idx}`"
                :is="urlDeleteMode ? 'div' : 'a'"
                :href="urlDeleteMode ? undefined : item.link"
                :target="urlDeleteMode ? undefined : '_blank'"
                :rel="urlDeleteMode ? undefined : 'noopener noreferrer'"
                class="pc-url-tile"
                :title="item.title"
                @click="urlDeleteMode ? onUrlTileClick($event) : undefined"
              >
                <input
                  v-if="urlDeleteMode"
                  type="checkbox"
                  class="pc-url-check"
                  :checked="selectedUrlKeys.includes(getUrlKey(item, idx))"
                  @click.stop
                  @change="onToggleUrlChecked(getUrlKey(item, idx), $event)"
                />
                <img v-if="item.icon" class="pc-url-icon" :src="toImageUrl(item.icon)" alt="" />
                <span v-else class="pc-url-icon pc-url-icon--placeholder" />
                <span class="pc-url-name">{{ item.title }}</span>
              </component>
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

    <!-- 批量导入预览 -->
    <n-modal v-model:show="importVisible" preset="card" draggable transform-origin="center" style="width: 860px;">
      <template #header>
        <div>批量导入预览</div>
      </template>
      <div class="pc-import-wrap">
        <p class="pc-import-tip">勾选要导入的节点。点击每个节点右侧“编辑”可修改分组或网址信息。</p>
        <n-tree
          class="pc-import-tree"
          checkable
          block-line
          cascade
          key-field="key"
          label-field="label"
          children-field="children"
          :data="importTreeData"
          :checked-keys="importCheckedKeys"
          :render-label="renderImportNodeLabel"
          @update:checked-keys="onImportCheckedKeysUpdate"
        />
      </div>
      <template #footer>
        <div class="pc-modal-footer">
          <n-button quaternary size="small" @click="importVisible = false">取消</n-button>
          <n-button type="primary" size="small" :loading="importSubmitting" @click="onConfirmImportSelected">确认导入</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 导入节点编辑 -->
    <n-modal v-model:show="nodeEditVisible" preset="card" transform-origin="center" style="width: 460px;">
      <template #header>
        <div>{{ nodeEditType === 'group' ? '编辑分组' : '编辑网址' }}</div>
      </template>
      <n-form v-if="nodeEditType === 'group'" label-placement="top" :model="editGroupForm" class="pc-form">
        <n-form-item label="分组名称">
          <n-input v-model:value="editGroupForm.title" placeholder="请输入分组名称" />
        </n-form-item>
        <n-form-item label="分组背景">
          <div class="pc-bg-row">
            <n-input v-model:value="editGroupForm.bgImages" placeholder="颜色值或图片地址" />
            <n-button class="pc-bg-upload" type="success" @click="onUploadImportGroupBg">上传</n-button>
          </div>
        </n-form-item>
        <n-form-item label="分组描述">
          <n-input v-model:value="editGroupForm.description" type="textarea" rows="3" placeholder="可选" />
        </n-form-item>
      </n-form>
      <n-form v-else label-placement="top" :model="editItemForm" class="pc-form">
        <n-form-item label="网址名称">
          <n-input v-model:value="editItemForm.title" placeholder="请输入名称" />
        </n-form-item>
        <n-form-item label="网址链接">
          <n-input v-model:value="editItemForm.link" placeholder="请输入链接" />
        </n-form-item>
        <n-form-item label="图标">
          <div class="pc-bg-row">
            <n-input v-model:value="editItemForm.icon" placeholder="可选：图片地址" />
            <n-button class="pc-bg-upload" type="success" @click="onUploadImportItemIcon">上传</n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="pc-modal-footer">
          <n-button quaternary size="small" @click="nodeEditVisible = false">取消</n-button>
          <n-button type="primary" size="small" @click="onSaveNodeEdit">保存</n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, h } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NButton, NTree } from 'naive-ui'
import { openImageCropper } from '@/services/imageCropper'
import request from '@/services/request'
import { msg } from '@/plugins/message'
import { handleGoogleHTMLOrJSON, type ParsedBookmarkGroup } from '@/utils'

// ===== state & types =====
const showModal = ref<boolean>(false)

type BookmarkGroup = {
  _id?: string
  name: string
  tags: string[]
  bgImages?: string
  description?: string
  addreamUrl?: Array<{ _id?: string; title: string; link: string; icon?: string; time?: string }>
}

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const groups = ref<BookmarkGroup[]>([])
const toImageUrl = (val: string) => (val.startsWith('http') ? val : apiBase + val)
const isColor = (val: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(val)
const bgStyle = (bg: string | undefined) => {
  const val = (bg ?? '').trim()
  if (!val) return {}
  if (isColor(val)) return { background: val }
  if (val.startsWith('/')) return { backgroundImage: `url(${toImageUrl(val)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (val.startsWith('http')) return { backgroundImage: `url(${val})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return {}
}
const cardBgStyle = bgStyle
const detailBgStyle = bgStyle

const mapGroup = (x: any): BookmarkGroup => ({
  _id: x?._id,
  name: String(x?.name ?? ''),
  tags: Array.isArray(x?.tags) ? x.tags.map((t: any) => String(t)) : [],
  bgImages: x?.bgImages != null ? String(x.bgImages) : '',
  description: x?.description != null ? String(x.description) : '',
  addreamUrl: Array.isArray(x?.addreamUrl)
    ? x.addreamUrl.map((u: any) => ({
      _id: u?._id != null ? String(u._id) : '',
      title: String(u?.title ?? ''),
      link: String(u?.link ?? ''),
      icon: u?.icon != null ? String(u.icon) : '',
      time: String(u?.time ?? ''),
    }))
    : [],
})

const fetchGroups = async () => {
  const res = (await request.get('/admin/bookmark/group')) as any
  const list = Array.isArray(res?.data) ? (res.data as BookmarkGroup[]) : []
  groups.value = list.map((x) => mapGroup(x as any))
}

const detailVisible = ref(false)
const detailReady = ref(false)
const detailItem = ref<BookmarkGroup | null>(null)
const detailStartRect = reactive({ top: 0, left: 0, width: 0, height: 0 })
const detailRect = reactive({ top: 0, left: 0, width: 0, height: 0 })
const addUrlVisible = ref(false)
const urlDeleteMode = ref(false)
const selectedUrlKeys = ref<string[]>([])
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
  Object.assign(detailRect, rect)
  Object.assign(detailPanelStyle, {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  })
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
  Object.assign(formModel, {
    name: '',
    tags: [],
    background: '',
    description: '',
  })
}

const addGroup = () => {
  editingGroupId.value = ''
  showModal.value = true
}

const bookmarkFileInputRef = ref<HTMLInputElement | null>(null)
const editingGroupId = ref('')
const importVisible = ref(false)
const importSubmitting = ref(false)
const importCheckedKeys = ref<string[]>([])
const importTreeData = ref<any[]>([])
type ImportBookmarkItem = { key: string; title: string; link: string; icon: string }
type ImportBookmarkGroup = { key: string; title: string; bgImages: string; description: string; tags: string[]; items: ImportBookmarkItem[] }
const importGroups = ref<ImportBookmarkGroup[]>([])

const nodeEditVisible = ref(false)
const nodeEditType = ref<'group' | 'item'>('group')
const editingNodeGroupKey = ref('')
const editingNodeItemKey = ref('')
const editGroupForm = reactive({ title: '', bgImages: '', description: '' })
const editItemForm = reactive({ title: '', link: '', icon: '' })

const onCancelCreate = () => closeCreateModal()

// 批量新增分组
const handleAddUploadGroup = () => {
  bookmarkFileInputRef.value?.click()
}

const onBookmarkFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = () => {
    const htmlContent = typeof reader.result === 'string' ? reader.result : ''
    if (!htmlContent.trim()) {
      msg.warning('文件内容为空')
      return
    }
    const parsedGroups = handleGoogleHTMLOrJSON(htmlContent)
    if (!parsedGroups.length) {
      msg.warning('未解析到有效分组')
      return
    }
    setupImportData(parsedGroups)
    importVisible.value = true
  }
  reader.onerror = () => {
    msg.error('文件读取失败')
  }
  

  // 允许重复选择同一个文件时也触发 change
  input.value = ''
}

const setupImportData = (parsedGroups: ParsedBookmarkGroup[]) => {
  importGroups.value = parsedGroups.map((group, gi) => ({
    key: `g-${gi}`,
    title: group.title || `分组-${gi + 1}`,
    bgImages: '',
    description: '',
    tags: [],
    items: group.items.map((item, ii) => ({
      key: `g-${gi}-i-${ii}`,
      title: item.title || `网址-${ii + 1}`,
      link: item.link || '',
      icon: item.icon || '',
    })),
  }))
  refreshImportTreeData()
  importCheckedKeys.value = []
}

const refreshImportTreeData = () => {
  importTreeData.value = importGroups.value.map((group) => ({
    key: group.key,
    label: group.title,
    children: group.items.map((item) => ({
      key: item.key,
      label: item.title,
      isLeaf: true,
      meta: { type: 'item', groupKey: group.key, itemKey: item.key },
    })),
    meta: { type: 'group', groupKey: group.key },
  }))
}

const onImportCheckedKeysUpdate = (keys: Array<string | number>) => {
  importCheckedKeys.value = keys.map((k) => String(k))
}

const openNodeEdit = (payload: { type: 'group' | 'item'; groupKey: string; itemKey?: string }) => {
  const group = importGroups.value.find((g) => g.key === payload.groupKey)
  if (!group) return
  editingNodeGroupKey.value = group.key
  editingNodeItemKey.value = payload.itemKey || ''

  if (payload.type === 'group') {
    nodeEditType.value = 'group'
    Object.assign(editGroupForm, {
      title: group.title,
      bgImages: group.bgImages,
      description: group.description,
    })
  } else {
    const item = group.items.find((i) => i.key === payload.itemKey)
    if (!item) return
    nodeEditType.value = 'item'
    Object.assign(editItemForm, {
      title: item.title,
      link: item.link,
      icon: item.icon,
    })
  }
  nodeEditVisible.value = true
}

const renderImportNodeLabel = ({ option }: { option: any }) =>
  h('div', { class: 'pc-import-node' }, [
    h('span', { class: 'pc-import-node-title' }, option.label),
    h('span', { class: 'pc-import-node-actions' }, [
      h(
        NButton,
        {
          quaternary: true,
          size: 'tiny',
          class: 'pc-import-node-edit',
          title: '编辑',
          onClick: (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (option.meta) openNodeEdit(option.meta)
          },
        },
        { default: () => '✎' },
      ),
    ]),
  ])

const onUploadImportGroupBg = async () => {
  try {
    const url = await openImageCropper({ title: '分组背景', shape: 'rect', aspectRatio: 16 / 10 })
    editGroupForm.bgImages = url
  } catch {
    // ignore
  }
}

const onUploadImportItemIcon = async () => {
  try {
    const url = await openImageCropper({ title: '网址图标', shape: 'circle' })
    editItemForm.icon = url
  } catch {
    // ignore
  }
}

const onSaveNodeEdit = () => {
  const group = importGroups.value.find((g) => g.key === editingNodeGroupKey.value)
  if (!group) return
  if (nodeEditType.value === 'group') {
    if (!editGroupForm.title.trim()) {
      msg.warning('分组名称不能为空')
      return
    }
    Object.assign(group, {
      title: editGroupForm.title.trim(),
      bgImages: editGroupForm.bgImages.trim(),
      description: editGroupForm.description.trim(),
    })
  } else {
    const item = group.items.find((i) => i.key === editingNodeItemKey.value)
    if (!item) return
    if (!editItemForm.title.trim()) {
      msg.warning('网址名称不能为空')
      return
    }
    if (!editItemForm.link.trim()) {
      msg.warning('网址链接不能为空')
      return
    }
    Object.assign(item, {
      title: editItemForm.title.trim(),
      link: editItemForm.link.trim(),
      icon: editItemForm.icon.trim(),
    })
  }
  refreshImportTreeData()
  nodeEditVisible.value = false
}

const onConfirmImportSelected = async () => {
  const selected = new Set(importCheckedKeys.value)
  const selectedGroups = importGroups.value
    .map((group) => {
      const selectedItems = group.items.filter((item) => selected.has(item.key))
      return {
        ...group,
        items: selectedItems,
      }
    })
    .filter((group) => group.items.length > 0)

  if (!selectedGroups.length) {
    msg.warning('请至少勾选一个网址节点')
    return
  }

  const payloadGroups = selectedGroups.map((group) => ({
    name: group.title,
    tags: group.tags,
    bgImages: group.bgImages,
    description: group.description,
    addreamUrl: group.items.map((item) => ({
      title: item.title,
      link: item.link,
      icon: item.icon,
    })),
  }))

  importSubmitting.value = true
  try {
    await request.post('/admin/bookmark/group/batch-import', { groups: payloadGroups })
    msg.success('批量导入完成')
    importVisible.value = false
    await fetchGroups()
  } catch {
    msg.error('批量导入失败')
  } finally {
    importSubmitting.value = false
  }
}

const onDeleteGroup = async (item: BookmarkGroup) => {
  const id = String(item?._id || '')
  if (!id) {
    msg.warning('该分组无法删除')
    return
  }
  try {
    await request.post('/admin/bookmark/group/delete', { _id: [id] })
    msg.success('分组已删除')
    await fetchGroups()
  } catch {
    msg.error('删除失败')
  }
}

const onEditGroup = (item: BookmarkGroup) => {
  const id = String(item?._id || '')
  if (!id) {
    msg.warning('该分组无法编辑')
    return
  }
  editingGroupId.value = id
  Object.assign(formModel, {
    name: item.name || '',
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    background: item.bgImages || '',
    description: item.description || '',
  })
  showModal.value = true
}

const closeCreateModal = () => {
  showModal.value = false
  editingGroupId.value = ''
  resetForm()
}

const syncDetailItemById = (id: string) => {
  detailItem.value = groups.value.find((g) => g._id === id) || null
}

watch(showModal, (v) => {
  // 点击遮罩/ESC 关闭时也要清空
  if (!v) {
    editingGroupId.value = ''
    resetForm()
  }
})

const onSubmitCreate = async () => {
  if (!formModel.name.trim()) {
    msg.warning('分组名称不能为空')
    return
  }
  try {
    const payload = {
      id: editingGroupId.value || undefined,
      name: formModel.name,
      tags: formModel.tags,
      bgImages: formModel.background,
      description: formModel.description,
    }
    await request.post('/admin/bookmark/group', payload)
    msg.success(editingGroupId.value ? '分组已更新' : '分组已创建')
    await fetchGroups()
    closeCreateModal()
  } catch {
    msg.error(editingGroupId.value ? '更新失败' : '创建失败')
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
  const target = e.target as HTMLElement | null
  if (target?.closest('.pc-card-action')) return
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
  Object.assign(urlForm, { title: '', link: '', icon: '' })
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
  cancelUrlDeleteMode()
  applyRect(detailStartRect)
  window.setTimeout(() => {
    detailVisible.value = false
    detailItem.value = null
  }, 260)
}

const getUrlKey = (item: { _id?: string; title: string; link: string; icon?: string; time?: string }, idx: number) =>
  item._id ? `id::${item._id}` : `${idx}::${item.title}::${item.link}::${item.icon || ''}::${item.time || ''}`

const onToggleUrlChecked = (key: string, e: Event) => {
  const checked = (e.target as HTMLInputElement | null)?.checked
  if (checked) {
    if (!selectedUrlKeys.value.includes(key)) selectedUrlKeys.value.push(key)
  } else {
    selectedUrlKeys.value = selectedUrlKeys.value.filter((k) => k !== key)
  }
}

const onUrlTileClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const openUrlDeleteMode = () => {
  urlDeleteMode.value = true
  selectedUrlKeys.value = []
}

const cancelUrlDeleteMode = () => {
  urlDeleteMode.value = false
  selectedUrlKeys.value = []
}

const confirmDeleteSelectedUrls = async () => {
  const id = detailItem.value?._id
  if (!id) return
  const list = detailItem.value?.addreamUrl || []
  const selectedSet = new Set(selectedUrlKeys.value)
  const selectedItems = list.filter((item, idx) => selectedSet.has(getUrlKey(item, idx)))
  const selectedIds = selectedItems.map((x) => String(x._id || '')).filter(Boolean)
  if (!selectedItems.length) {
    msg.warning('请先选择要删除的网址')
    return
  }
  if (!selectedIds.length) {
    msg.warning('当前数据缺少网址 _id，无法删除')
    return
  }
  try {
    await request.post(`/admin/bookmark/group/${id}/url/batch-delete`, {
      _id: selectedIds,
    })
    await fetchGroups()
    syncDetailItemById(id)
    cancelUrlDeleteMode()
    msg.success('删除成功')
  } catch {
    msg.error('删除失败')
  }
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
    syncDetailItemById(id)
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
  height: 100%;
  box-sizing: border-box;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(14, 20, 42, 0.72), rgba(10, 14, 32, 0.66));
  border: 1px solid rgba(123, 167, 255, 0.18);
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

.pc-hidden-file-input {
  display: none;
}

.pc-import-wrap {
  max-height: 62vh;
  overflow: auto;
}

.pc-import-tip {
  margin: 0 0 10px;
  color: #8f9bc2;
  font-size: 12px;
}

.pc-import-tree {
  border: 1px solid rgba(123, 167, 255, 0.35);
  border-radius: 10px;
  padding: 12px;
  max-height: 52vh;
  overflow: auto;
  background:
    linear-gradient(180deg, rgba(17, 24, 49, 0.86), rgba(11, 16, 36, 0.86));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: #eef3ff;
}

.pc-import-tree :deep(.n-tree-node-content) {
  padding: 6px 8px;
  border-radius: 8px;
  color: #eef3ff;
}

.pc-import-tree :deep(.n-tree-node-content:hover) {
  background: rgba(123, 167, 255, 0.18);
  color: #fff;
}

.pc-import-tree :deep(.n-tree-node--selected > .n-tree-node-content),
.pc-import-tree :deep(.n-tree-node--pending > .n-tree-node-content) {
  background: rgba(123, 167, 255, 0.22);
  color: #fff;
}

.pc-import-tree :deep(.n-tree-node-content__text) {
  color: #eef3ff !important;
}

.pc-import-tree :deep(.n-tree-node-content__prefix),
.pc-import-tree :deep(.n-tree-node-switcher),
.pc-import-tree :deep(.n-base-icon) {
  color: #d8e4ff !important;
}

.pc-import-node {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pc-import-node-actions {
  margin-left: auto;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
}

.pc-import-node-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #f1f5ff;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.28);
}

.pc-import-node-edit {
  opacity: 0;
  transform: translateX(2px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pc-import-node-edit :deep(.n-button__content) {
  color: #8ec0ff;
  font-size: 14px;
  line-height: 1;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(123, 167, 255, 0.16);
  border: 1px solid rgba(123, 167, 255, 0.3);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
}

.pc-import-tree :deep(.n-tree-node-content:hover) .pc-import-node-edit {
  opacity: 1;
  transform: translateX(0);
}

.pc-import-node-edit:hover {
  opacity: 1;
}

.pc-import-node-edit:hover :deep(.n-button__content) {
  color: #ffffff;
  background: rgba(123, 167, 255, 0.28);
  border-color: rgba(170, 205, 255, 0.7);
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

.pc-card-delete {
  position: absolute !important;
  top: 6px;
  right: 6px;
  z-index: 5;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(255, 162, 170, 0.45);
  border-radius: 6px;
  background: linear-gradient(160deg, rgba(34, 12, 18, 0.58), rgba(22, 8, 12, 0.52));
  color: #ffc8d0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  backdrop-filter: blur(2px);
  box-shadow: 0 2px 8px rgba(255, 95, 120, 0.16);
  transition: all 0.18s ease;
}

.pc-card-edit {
  position: absolute !important;
  top: 6px;
  right: 34px;
  z-index: 9999;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(123, 167, 255, 0.45);
  border-radius: 6px;
  background: rgba(15, 24, 52, 0.62);
  color: #d9e6ff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  transition: all 0.15s ease;
}

.pc-card-edit:hover {
  background: rgba(23, 38, 76, 0.78);
  border-color: rgba(162, 195, 255, 0.72);
  color: #fff;
  transform: translateY(-1px);
}

.pc-card-delete:hover {
  background: linear-gradient(160deg, rgba(52, 14, 24, 0.76), rgba(28, 8, 14, 0.7));
  border-color: rgba(255, 188, 198, 0.82);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 95, 120, 0.24);
  transform: translateY(-1px);
}

.pc-action-icon-btn {
  min-width: 28px;
  padding: 0 6px;
  color: #ffb8c4 !important;
  font-size: 14px;
  line-height: 1;
}

.pc-action-icon-btn:hover {
  color: #ffd9df !important;
}

.pc-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 10px 20px rgba(255, 255, 255, 0.16),
    0 3px 10px rgba(255, 255, 255, 0.08);
}

/* 背景变暗：即使白图也保证文字可读 */
.pc-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.86) 0%,
    rgba(0, 0, 0, 0.62) 25%,
    rgba(0, 0, 0, 0.38) 50%,
    rgba(0, 0, 0, 0.14) 72%,
    rgba(0, 0, 0, 0) 100%
  );
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
  display: block;
  width: 50%;
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

.pc-detail-actions {
  display: flex;
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

.pc-url-check {
  width: 14px;
  height: 14px;
  margin: 0 2px 0 0;
  accent-color: #7fb0ff;
  flex: 0 0 auto;
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

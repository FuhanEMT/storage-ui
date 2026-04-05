<template>
  <section class="model-setting-page">
    <header class="ms-header">
      <h2 class="ms-title">模块列表</h2>
      <p class="ms-desc">在此管理当前模块的偏好与参数，后续可在此扩展配置项。</p>
    </header>
    <div class="ms-toolbar">
      <n-button type="primary" @click="openAddModal">新增模型</n-button>
    </div>
    <ConsoleDataTable :columns="columns" :data="tableData" :loading="tableLoading" :scroll-x="1240" :min-height="320" />

    <n-modal
      v-model:show="addModalVisible"
      preset="card"
      :title="modelModalTitle"
      :bordered="false"
      style="width: min(520px, 94vw)"
      @after-leave="resetAddForm"
    >
      <n-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        class="ms-add-form"
      >
        <n-form-item label="主模型名称" path="modelName">
          <n-input v-model:value="addForm.modelName" placeholder="必填" clearable />
        </n-form-item>
        <n-form-item label="是否为在线模型" path="isModelHttp">
          <n-switch v-model:value="addForm.isModelHttp" />
        </n-form-item>
        <n-form-item :label="addForm.isModelHttp ? '模型链接' : '模型文件夹'" path="modelUrl">
          <n-input
            v-if="addForm.isModelHttp"
            v-model:value="addForm.modelUrl"
            placeholder="必填：在线模型地址（如 https://...）"
            clearable
          />
          <div v-else class="ms-url-col">
            <p class="ms-folder-hint">
              请选择<strong>整个模型文件夹</strong>（内含 .model3.json、.moc3、贴图子目录等），上传后会自动填入入口
              .model3.json 的访问地址。
            </p>
            <div class="ms-url-row">
              <n-input
                v-model:value="addForm.modelUrl"
                class="ms-url-input"
                placeholder="上传文件夹后自动填入，或手动粘贴 /uploads/... 入口地址"
                clearable
              />
              <n-button :loading="modelUrlUploading" @click="modelFolderInputRef?.click()">选择文件夹</n-button>
              <input
                ref="modelFolderInputRef"
                type="file"
                class="ms-hidden-file"
                webkitdirectory
                directory
                multiple
                @change="onModelFolderChange"
              />
            </div>
          </div>
        </n-form-item>
        <n-form-item label="模型类型" path="modelType">
          <n-select
            v-model:value="addForm.modelType"
            class="ms-model-type-select"
            :options="modelTypeOptions"
            placeholder="请选择模型类型"
            clearable
          />
        </n-form-item>
        <n-form-item label="模型描述" path="modelDes">
          <n-input v-model:value="addForm.modelDes" type="textarea" placeholder="选填" :rows="3" clearable />
        </n-form-item>
        <n-form-item label="是否展示" path="isPresen">
          <n-switch v-model:value="addForm.isPresen" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="ms-modal-footer">
          <n-button @click="addModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="addSubmitting" @click="submitAdd">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="patternModalVisible"
      preset="card"
      title="动画模型"
      :bordered="false"
      class="ms-pattern-modal"
      style="width: min(720px, 94vw)"
      @after-leave="clearPatternModalData"
    >
      <p class="ms-pattern-hint">
        动画模型：是主模型的动作延伸，Live2D 中模型与动画是分开的，所以在设置主模型后需要设置对应的主模型动画，才能让模型动起来。为了保证模型的动画完整性和功能性，请上传对应主模型下的动画模型
      </p>
      <div>
        <n-button type="primary" style="margin-bottom: 12px;" @click="openAddPatternModal">新增动画模型</n-button>
      </div>
      <ConsoleDataTable
        :columns="patternColumns"
        :data="patternTableData"
        :loading="false"
        :scroll-x="560"
        :min-height="240"
        :flex-height="false"
        :fill="false"
        :show-seq="false"
      />
      <template #footer>
        <div class="ms-modal-footer">
          <n-button type="primary" @click="patternModalVisible = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="animationAddModalVisible"
      preset="card"
      title="新增动画模型"
      :bordered="false"
      style="width: min(480px, 94vw)"
      @after-leave="resetAnimationAddForm"
    >
      <n-form
        ref="animationFormRef"
        :model="animationAddForm"
        :rules="animationAddRules"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        class="ms-add-form"
      >
        <n-form-item label="动画名称" path="name">
          <n-input v-model:value="animationAddForm.name" placeholder="必填" clearable />
        </n-form-item>
        <n-form-item label="动画链接" path="url">
          <div class="ms-url-row">
            <n-input
              v-model:value="animationAddForm.url"
              class="ms-url-input"
              placeholder="必填：填写地址或上传 .exp3.json / .motion3.json 等"
              clearable
            />
            <n-button :loading="animationUrlUploading" @click="animationFileInputRef?.click()">上传</n-button>
            <input
              ref="animationFileInputRef"
              type="file"
              class="ms-hidden-file"
              accept=".json,.exp3.json,.motion3.json,application/json"
              @change="onAnimationFileChange"
            />
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="ms-modal-footer">
          <n-button @click="animationAddModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="animationAddSubmitting" @click="submitAnimationAdd">确定</n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import ConsoleDataTable from '@/components/ConsoleDataTable.vue'
import {
  consoleActionButtonsColumn,
  consoleBooleanColumn,
  type ConsoleActionButton,
  type ConsoleTableColumn,
} from '@/utils/consoleTable'
import { msg } from '@/plugins/message'
import request from '@/services/request'
import type { FormInst, FormRules } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

type ApiBody<T> = { code?: number; data?: T; message?: string; success?: boolean }

/** 模型类型下拉（写死，与入库字段 modelType 一致） */
const modelTypeOptions = [
  { label: 'v1模型（已遗弃)', value: 'v1模型（已遗弃)' },
  { label: 'v2模型', value: 'v2模型' },
  { label: 'v3模型', value: 'v3模型' },
  { label: 'v4模型', value: 'v4模型' },
  { label: '3D模型', value: '3D模型' },
]

/** 主模型文档中的 animation 数组项（与库字段一致） */
type ModelAnimationItem = { _id?: string; name: string; url: string }

/** 表格行与新增表单共用；新增时 modelType 可为 null 表示未选择 */
type ModelRow = {
  _id?: string
  modelName: string
  modelUrl: string
  modelType: string | null
  modelDes: string
  isModelHttp: boolean
  /** 是否作为展示模型（与后端字段名一致） */
  isPresen: boolean
  animation: ModelAnimationItem[]
}

const createEmptyRow = (): ModelRow => ({
  modelName: '',
  modelUrl: '',
  modelType: null,
  modelDes: '',
  isModelHttp: false,
  isPresen: false,
  animation: [],
})

const tableData = ref<ModelRow[]>([])
const tableLoading = ref(false)
const deletingId = ref<string | null>(null)
const displaySettingId = ref<string | null>(null)

/** 动画模型弹窗表格行 */
type PatternTableRow = { name: string; url: string; _id?: string }

const patternModalVisible = ref(false)
const patternParentModelId = ref<string | null>(null)
const patternTableData = ref<PatternTableRow[]>([])

const patternColumns: ConsoleTableColumn<PatternTableRow>[] = [
  { field: 'name', title: '动画名称', minWidth: 180, showOverflow: 'tooltip', align: 'center' },
  { field: 'url', title: '动画链接', minWidth: 280, showOverflow: 'tooltip', align: 'center' },
]

const animationAddModalVisible = ref(false)
const animationFormRef = ref<FormInst | null>(null)
const animationAddForm = ref({ name: '', url: '' })
const animationAddSubmitting = ref(false)
const animationUrlUploading = ref(false)
const animationFileInputRef = ref<HTMLInputElement | null>(null)

const animationAddRules: FormRules = {
  name: [{ required: true, message: '请输入动画名称', trigger: ['blur', 'input'] }],
  url: [{ required: true, message: '请输入动画链接', trigger: ['blur', 'input'] }],
}

function parseAnimationFromDoc(raw: unknown): ModelAnimationItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((x) => {
    const o = x as Record<string, unknown>
    return {
      _id: o._id != null ? String(o._id) : undefined,
      name: String(o.name ?? ''),
      url: String(o.url ?? ''),
    }
  })
}

function animationsToPatternRows(items: ModelAnimationItem[]): PatternTableRow[] {
  return items.map((a) => ({ _id: a._id, name: a.name, url: a.url }))
}

function openPatternModal(row: ModelRow) {
  const id = row._id
  if (!id) {
    msg.error('缺少主模型 ID')
    return
  }
  patternParentModelId.value = id
  patternTableData.value = animationsToPatternRows(row.animation ?? [])
  patternModalVisible.value = true
}

function clearPatternModalData() {
  patternTableData.value = []
  patternParentModelId.value = null
}

function openAddPatternModal() {
  if (!patternParentModelId.value) {
    msg.error('未选择主模型')
    return
  }
  resetAnimationAddForm()
  animationAddModalVisible.value = true
}

function resetAnimationAddForm() {
  animationAddForm.value = { name: '', url: '' }
  animationFormRef.value?.restoreValidation()
  if (animationFileInputRef.value) animationFileInputRef.value.value = ''
}

const onAnimationFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  animationUrlUploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const res = (await request.post('/admin/model/upload', form, {
      timeout: 120_000,
    })) as { data?: { url?: string } }
    const url = res?.data?.url
    if (!url) throw new Error('no url')
    animationAddForm.value.url = url
    msg.success('上传成功，已填入链接')
  } catch {
    msg.error('上传失败')
  } finally {
    animationUrlUploading.value = false
    input.value = ''
  }
}

function syncPatternTableFromMainList() {
  const id = patternParentModelId.value
  if (!id) return
  const row = tableData.value.find((r) => r._id === id)
  patternTableData.value = animationsToPatternRows(row?.animation ?? [])
}

async function submitAnimationAdd() {
  try {
    await animationFormRef.value?.validate()
  } catch {
    return
  }
  const modelId = patternParentModelId.value
  if (!modelId) {
    msg.error('未选择主模型')
    return
  }
  const { name, url } = animationAddForm.value
  animationAddSubmitting.value = true
  try {
    await request.post('/admin/model/animation', {
      _id: modelId,
      name: name.trim(),
      url: url.trim(),
    })
    msg.success('已添加动画')
    animationAddModalVisible.value = false
    await loadModelList()
    syncPatternTableFromMainList()
  } catch {
    msg.error('添加失败')
  } finally {
    animationAddSubmitting.value = false
  }
}

function normalizeModelDoc(raw: Record<string, unknown>): ModelRow {
  return {
    _id: raw._id != null ? String(raw._id) : undefined,
    modelName: String(raw.modelName ?? ''),
    modelUrl: String(raw.modelUrl ?? ''),
    modelType: String(raw.modelType ?? ''),
    modelDes: String(raw.modelDes ?? ''),
    isModelHttp: Boolean(raw.isModelHttp),
    isPresen: typeof raw.isPresen === 'boolean' ? raw.isPresen : false,
    animation: parseAnimationFromDoc(raw.animation),
  }
}

async function loadModelList() {
  tableLoading.value = true
  try {
    const res = (await request.get('/admin/model/list')) as ApiBody<Record<string, unknown>[]>
    const list = Array.isArray(res?.data) ? res.data : []
    tableData.value = list.map((d) => normalizeModelDoc(d))
  } catch {
    msg.error('加载模型列表失败')
    tableData.value = []
  } finally {
    tableLoading.value = false
  }
}

onMounted(() => {
  loadModelList()
})

const addModalVisible = ref(false)
const addFormRef = ref<FormInst | null>(null)
const addForm = ref<ModelRow>(createEmptyRow())
const addSubmitting = ref(false)

const modelModalTitle = computed(() => (addForm.value._id ? '编辑模型' : '新增模型'))
const modelUrlUploading = ref(false)
const modelFolderInputRef = ref<HTMLInputElement | null>(null)

const onModelFolderChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const list = input.files
  if (!list?.length) return
  modelUrlUploading.value = true
  try {
    const form = new FormData()
    const arr = Array.from(list)
    for (const f of arr) {
      const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name
      form.append('files', f, rel)
    }
    const res = (await request.post('/admin/model/upload-folder', form, {
      timeout: 600_000,
    })) as { data?: { url?: string } }
    const url = res?.data?.url
    if (!url) throw new Error('no url')
    addForm.value.modelUrl = url
    addForm.value.isModelHttp = false
    msg.success('文件夹上传成功，已填入模型入口地址')
  } catch {
    msg.error('文件夹上传失败，请确认已选择完整目录且内含 .model3.json')
  } finally {
    modelUrlUploading.value = false
    input.value = ''
  }
}

const addRules: FormRules = {
  modelName: [{ required: true, message: '请输入主模型名称', trigger: ['blur', 'input'] }],
  modelUrl: [{ required: true, message: '请填写模型链接或上传本地模型文件夹', trigger: ['blur', 'input'] }],
  modelType: [
    {
      validator: (_rule, v: string | null) =>
        (typeof v === 'string' && v.trim() !== '') || new Error('请选择模型类型'),
      trigger: ['blur', 'change'],
    },
  ],
}

const openAddModal = () => {
  resetAddForm()
  addModalVisible.value = true
}

const resetAddForm = () => {
  addForm.value = createEmptyRow()
  addFormRef.value?.restoreValidation()
}

const submitAdd = async () => {
  try {
    await addFormRef.value?.validate()
  } catch {
    return
  }
  const f = addForm.value
  const isEdit = Boolean(f._id)
  addSubmitting.value = true
  try {
    await request.post('/admin/model', {
      ...(isEdit ? { _id: f._id } : {}),
      modelName: f.modelName.trim(),
      modelUrl: f.modelUrl.trim(),
      modelType: String(f.modelType ?? '').trim(),
      modelDes: f.modelDes.trim(),
      isModelHttp: f.isModelHttp,
      isPresen: f.isPresen,
    })
    msg.success(isEdit ? '已更新' : '已添加')
    addModalVisible.value = false
    await loadModelList()
  } catch {
    msg.error(isEdit ? '更新失败' : '保存失败')
  } finally {
    addSubmitting.value = false
  }
}

function onEditRow(row: ModelRow) {
  const id = row._id
  if (!id) {
    msg.error('缺少记录 ID')
    return
  }
  addForm.value = {
    _id: id,
    modelName: row.modelName,
    modelUrl: row.modelUrl,
    modelType: row.modelType,
    modelDes: row.modelDes,
    isModelHttp: row.isModelHttp,
    isPresen: row.isPresen,
    animation: row.animation ?? [],
  }
  addFormRef.value?.restoreValidation()
  addModalVisible.value = true
}

async function onDeleteRow(row: ModelRow): Promise<boolean> {
  const id = row._id
  if (!id) {
    msg.error('缺少记录 ID')
    return false
  }
  deletingId.value = id
  try {
    await request.post('/admin/model/delete', { _id: id })
    msg.success('已删除')
    await loadModelList()
    return true
  } catch {
    msg.error('删除失败')
    return false
  } finally {
    deletingId.value = null
  }
}

/** 设置/取消展示：后端按 _id 查库后只改 isPresen，仅 isPresen 参数不同 */
async function setModelPresent(row: ModelRow, isPresen: boolean): Promise<boolean> {
  const id = row._id
  if (!id) {
    msg.error('缺少记录 ID')
    return false
  }
  displaySettingId.value = id
  try {
    await request.post('/admin/model/present', { _id: id, isPresen })
    msg.success(isPresen ? '已设为展示模型' : '已取消展示')
    await loadModelList()
    return true
  } catch {
    msg.error(isPresen ? '设置失败' : '操作失败')
    return false
  } finally {
    displaySettingId.value = null
  }
}

const modelActionButtons: ConsoleActionButton<ModelRow>[] = [
  { text: '编辑', type: 'primary', quaternary: true, onClick: onEditRow },
  {
    text: '设置为展示模型',
    type: 'success',
    quaternary: true,
    confirmText: '确定设置为展示模型？',
    loading: (row) => displaySettingId.value === row._id,
    display: (row) => !row.isPresen,
    onClick: (row) => setModelPresent(row, true),
  },
  {
    text: '取消展示模型',
    type: 'warning',
    quaternary: true,
    confirmText: '确定取消展示模型？',
    loading: (row) => displaySettingId.value === row._id,
    display: (row) => !!row.isPresen,
    onClick: (row) => setModelPresent(row, false),
  },
  {
    text: '设置动画模型',
    type: 'info',
    quaternary: true,
    onClick: (row) => openPatternModal(row),
  },
  {
    text: '删除',
    type: 'error',
    quaternary: true,
    confirmText: '确定删除该模型？',
    loading: (row) => deletingId.value === row._id,
    onClick: onDeleteRow,
  },
]

const columns: ConsoleTableColumn<ModelRow>[] = [
  { field: 'modelName', title: '主模型名称', width: 200, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelUrl', title: '模型链接', minWidth: 220, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelType', title: '模型类型', width: 160, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelDes', title: '模型描述', minWidth: 180, showOverflow: 'tooltip', align: 'center' },
  consoleBooleanColumn<ModelRow>('isModelHttp', '是否为在线模型', { width: 140, trueText: '是', falseText: '否' }),
  consoleBooleanColumn<ModelRow>('isPresen', '是否展示', { width: 120, trueText: '是', falseText: '否' }),
  consoleActionButtonsColumn<ModelRow>('操作', modelActionButtons, { width: 420 }),
]
</script>

<style scoped>
.model-setting-page {
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

.ms-header {
  margin-bottom: 2px;
}

.ms-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.ms-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8f9bc2;
}

.ms-toolbar {
  display: flex;
  justify-content: flex-start;
}

.ms-add-form {
  margin-top: 8px;
}

.ms-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ms-url-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.ms-url-input {
  flex: 1;
  min-width: 0;
}

.ms-hidden-file {
  display: none;
}

.ms-model-type-select {
  width: 100%;
}

.ms-url-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.ms-folder-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #8f9bc2;
}

.ms-pattern-modal :deep(.cdt-root) {
  max-height: min(52vh, 420px);
}

.ms-pattern-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8f9bc2;
}
</style>

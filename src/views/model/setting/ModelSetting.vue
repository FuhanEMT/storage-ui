<template>
  <section class="model-setting-page">
    <header class="ms-header">
      <h2 class="ms-title">模块列表</h2>
      <p class="ms-desc">在此管理当前模块的偏好与参数，后续可在此扩展配置项。</p>
    </header>
    <div class="ms-toolbar">
      <n-button type="primary" @click="openAddModal">新增模型</n-button>
    </div>
    <ConsoleDataTable :columns="columns" :data="tableData" :scroll-x="1000" :min-height="320" />

    <n-modal
      v-model:show="addModalVisible"
      preset="card"
      title="新增模型"
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
        <n-form-item label="模型名称" path="modelName">
          <n-input v-model:value="addForm.modelName" placeholder="必填" clearable />
        </n-form-item>
        <n-form-item label="模型链接" path="modelUrl">
          <div class="ms-url-row">
            <n-input
              v-model:value="addForm.modelUrl"
              class="ms-url-input"
              placeholder="必填：可填写地址或点击右侧上传"
              clearable
            />
            <n-button :loading="modelUrlUploading" @click="modelFileInputRef?.click()">上传</n-button>
            <input
              ref="modelFileInputRef"
              type="file"
              class="ms-hidden-file"
              accept=".json,.zip,.moc3,.model3.json,application/json,application/zip"
              @change="onModelFileChange"
            />
          </div>
        </n-form-item>
        <n-form-item label="模型类型" path="modelType">
          <n-input v-model:value="addForm.modelType" placeholder="必填" clearable />
        </n-form-item>
        <n-form-item label="模型描述" path="modelDes">
          <n-input v-model:value="addForm.modelDes" type="textarea" placeholder="选填" :rows="3" clearable />
        </n-form-item>
        <n-form-item label="是否为在线模型" path="isModelHttp">
          <n-radio-group v-model:value="addForm.isModelHttp">
            <n-radio :value="true">是</n-radio>
            <n-radio :value="false">否</n-radio>
          </n-radio-group>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="ms-modal-footer">
          <n-button @click="addModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="addSubmitting" @click="submitAdd">确定</n-button>
        </div>
      </template>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import ConsoleDataTable from '@/components/ConsoleDataTable.vue'
import { consoleBooleanColumn, type ConsoleTableColumn } from '@/utils/consoleTable'
import { msg } from '@/plugins/message'
import request from '@/services/request'
import type { FormInst, FormRules } from 'naive-ui'
import { h, ref } from 'vue'
import { NButton } from 'naive-ui'

/** 表格行与新增表单共用；新增时 isModelHttp 可为 null 表示未选择 */
type ModelRow = {
  modelName: string
  modelUrl: string
  modelType: string
  modelDes: string
  isModelHttp: boolean | null
}

const createEmptyRow = (): ModelRow => ({
  modelName: '',
  modelUrl: '',
  modelType: '',
  modelDes: '',
  isModelHttp: null,
})

const tableData = ref<ModelRow[]>([
  {
    modelName: '示例模型 A',
    modelUrl: '/assets/live2DModel/Nahida_1080/Nahida_1080.model3.json',
    modelType: 'Live2D Cubism 4',
    modelDes: '本地 public 资源示例',
    isModelHttp: false,
  },
  {
    modelName: '示例模型 B',
    modelUrl: 'https://example.com/model.model3.json',
    modelType: 'Live2D Cubism 4',
    modelDes: '在线地址示例（占位）',
    isModelHttp: true,
  },
])

const addModalVisible = ref(false)
const addFormRef = ref<FormInst | null>(null)
const addForm = ref<ModelRow>(createEmptyRow())
const addSubmitting = ref(false)
const modelUrlUploading = ref(false)
const modelFileInputRef = ref<HTMLInputElement | null>(null)

const onModelFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  modelUrlUploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const res = (await request.post('/admin/model/upload', form, {
      timeout: 120_000,
    })) as { data?: { url?: string } }
    const url = res?.data?.url
    if (!url) throw new Error('no url')
    addForm.value.modelUrl = url
    addForm.value.isModelHttp = false
    msg.success('上传成功，已填入链接')
  } catch {
    msg.error('上传失败')
  } finally {
    modelUrlUploading.value = false
    input.value = ''
  }
}

const addRules: FormRules = {
  modelName: [{ required: true, message: '请输入模型名称', trigger: ['blur', 'input'] }],
  modelUrl: [{ required: true, message: '请输入模型链接', trigger: ['blur', 'input'] }],
  modelType: [{ required: true, message: '请输入模型类型', trigger: ['blur', 'input'] }],
  isModelHttp: [
    {
      validator: (_rule, v: boolean | null) =>
        v === true || v === false ? true : new Error('请选择是否为在线模型'),
      trigger: ['change', 'blur'],
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
  if (f.isModelHttp !== true && f.isModelHttp !== false) return
  addSubmitting.value = true
  try {
    tableData.value.push({
      modelName: f.modelName.trim(),
      modelUrl: f.modelUrl.trim(),
      modelType: f.modelType.trim(),
      modelDes: f.modelDes.trim(),
      isModelHttp: f.isModelHttp as boolean,
    })
    msg.success('已添加')
    addModalVisible.value = false
  } finally {
    addSubmitting.value = false
  }
}

const columns: ConsoleTableColumn<ModelRow>[] = [
  { field: 'modelName', title: '模型名称', width: 200, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelUrl', title: '模型链接', minWidth: 220, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelType', title: '模型类型', width: 160, showOverflow: 'tooltip', align: 'center' },
  { field: 'modelDes', title: '模型描述', minWidth: 180, showOverflow: 'tooltip', align: 'center' },
  consoleBooleanColumn<ModelRow>('isModelHttp', '是否为在线模型', { width: 140, trueText: '是', falseText: '否' }),
  {
    field: 'action',
    title: '操作',
    width: 200,
    align: 'center',
    slots: {
      default: () =>
        h('div', [
          h(
            NButton,
            {
              type: 'primary',
              size: 'small',
              quaternary: true,
              style: { marginRight: '10px' },
              onClick: () => {
                console.log('编辑')
              },
            },
            { default: () => '编辑' },
          ),
          h(
            NButton,
            {
              type: 'error',
              size: 'small',
              quaternary: true,
              onClick: () => {
                console.log('删除')
              },
            },
            { default: () => '删除' },
          ),
        ]),
    },
  },
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
</style>

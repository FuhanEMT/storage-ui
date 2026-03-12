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
      <article class="pc-card">
        <h3 class="pc-card-title">插画素材库</h3>
        <p class="pc-card-desc">收集你常用的立绘、背景与贴图站点。</p>
        <div class="pc-chip-row">
          <span class="pc-chip">插画</span>
          <span class="pc-chip">背景</span>
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
          <n-input v-model:value="formModel.background" placeholder="请输入背景图片地址或颜色值，如 #1e293b" />
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
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { NModal, NForm, NFormItem, NInput, NSelect, NButton } from 'naive-ui'

// 分组弹窗
const showModal = ref<boolean>(false)

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

const onSubmitCreate = () => {
  // 这里暂时只做简单必填校验和关闭弹窗，可以在接入接口时再扩展
  if (!formModel.name.trim()) {
    // 如果项目里有全局 message，这里可以改成 message.warning
    return
  }
  showModal.value = false
  resetForm()
}
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
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(10, 14, 38, 0.96);
  border: 1px solid rgba(123, 167, 255, 0.35);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.65);
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

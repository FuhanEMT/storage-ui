<template>
  <Teleport to="body">
    <div v-if="state.visible" class="modal-mask" @click.self="onCancel">
      <div class="modal-box crop-modal">
        <h3 class="modal-title">{{ state.title }}</h3>

        <div v-if="step === 'upload'" class="crop-upload" @click="fileInputRef?.click()">
          <input ref="fileInputRef" type="file" accept="image/*" class="hide" @change="onFileChange" />
          <span>点击上传图片</span>
        </div>

        <div v-else class="crop-body">
          <div class="crop-area">
            <Cropper
              ref="cropperRef"
              class="crop-component"
              :src="imageSrc"
              :stencil-component="state.shape === 'circle' ? CircleStencil : RectangleStencil"
              :stencil-props="state.shape === 'rect' ? { aspectRatio: state.aspectRatio } : undefined"
              :default-size="defaultSize"
              @change="onCropChange"
            />
          </div>

          <div class="crop-preview-wrap">
            <span class="flat-label">预览</span>
            <div :class="state.shape === 'circle' ? 'crop-preview-circle' : 'crop-preview-rect'">
              <img v-if="previewUrl" :src="previewUrl" alt="" class="crop-preview-img" />
            </div>
          </div>
        </div>

        <div class="modal-actions crop-actions">
          <button v-if="step === 'upload'" type="button" class="modal-btn modal-btn-cancel" @click="onCancel">取消</button>
          <template v-else>
            <button type="button" class="modal-btn modal-btn-cancel" @click="step = 'upload'; revoke()">重新选择</button>
            <button type="button" class="modal-btn modal-btn-ok" :disabled="uploading" @click="onConfirm">
              {{ uploading ? '上传中...' : '确定' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import request from '@/services/request'
import { msg } from '@/plugins/message'
import { cropperState as state, rejectImageCropper, resolveImageCropper } from '@/services/imageCropper'

type Step = 'upload' | 'crop'
const step = ref<Step>('upload')
const imageSrc = ref('')
const previewUrl = ref('')
const uploading = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

watch(
  () => state.visible,
  (v) => {
    if (v) {
      step.value = 'upload'
      revoke()
    }
  },
)

const defaultSize = computed(() => {
  return ({ imageSize }: { imageSize: { width: number; height: number } }) => {
    if (state.shape === 'circle') {
      const size = Math.min(imageSize.width, imageSize.height)
      return { width: size, height: size }
    }
    const ratio = state.aspectRatio || 16 / 10
    const w = imageSize.width
    const h = imageSize.height
    if (w / h >= ratio) return { width: h * ratio, height: h }
    return { width: w, height: w / ratio }
  }
})

function revoke() {
  if (imageSrc.value?.startsWith('blob:')) URL.revokeObjectURL(imageSrc.value)
  imageSrc.value = ''
  previewUrl.value = ''
}

function onCancel() {
  revoke()
  rejectImageCropper(new Error('cancelled'))
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file?.type.startsWith('image/')) {
    msg.warning('请选择图片文件')
    return
  }
  revoke()
  imageSrc.value = URL.createObjectURL(file)
  step.value = 'crop'
  ;(e.target as HTMLInputElement).value = ''
}

function onCropChange() {
  const r = cropperRef.value?.getResult()
  if (r?.canvas) previewUrl.value = r.canvas.toDataURL('image/jpeg', 0.85)
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })
}

async function uploadBlob(blob: Blob): Promise<string> {
  const form = new FormData()
  form.append('image', blob, 'image.jpg')
  const res = (await request.post('/admin/user/upload-image', form)) as { data?: { url?: string } }
  const url = res?.data?.url
  if (!url) throw new Error('no url')
  return url
}

async function onConfirm() {
  const canvas = cropperRef.value?.getResult()?.canvas
  if (!canvas) return
  uploading.value = true
  try {
    const blob = await canvasToBlob(canvas, 0.85)
    const url = await uploadBlob(blob)
    revoke()
    resolveImageCropper(url)
  } catch (err) {
    msg.error('上传失败')
    rejectImageCropper(err)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.modal-box {
  width: 90%;
  max-width: 360px;
  padding: 24px;
  border-radius: 16px;
  background: rgba(12, 16, 38, 0.98);
  border: 1px solid rgba(123, 167, 255, 0.3);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
}

.modal-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #e0ebff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.modal-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.modal-btn-cancel {
  border: 1px solid rgba(123, 167, 255, 0.4);
  background: transparent;
  color: #a7b4d8;
}

.modal-btn-ok {
  border: none;
  background: linear-gradient(135deg, #ff9ad8, #9bb5ff);
  color: #0d1020;
}

.crop-modal {
  max-width: 720px;
}

.hide {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.crop-upload {
  height: 200px;
  border: 2px dashed rgba(123, 167, 255, 0.4);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #8f9bc2;
  font-size: 14px;
}

.crop-body {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 24px;
  align-items: start;
  min-height: 320px;
}

.crop-area {
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #0a0e26;
}

.crop-component {
  height: 100%;
}

.crop-component :deep(.vue-advanced-cropper) {
  height: 100%;
}

.crop-preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flat-label {
  font-size: 12px;
  font-weight: 500;
  color: #a7b4d8;
}

.crop-preview-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(123, 167, 255, 0.4);
  background: rgba(16, 20, 42, 0.8);
}

.crop-preview-rect {
  width: 160px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 3px solid rgba(123, 167, 255, 0.4);
  background: rgba(16, 20, 42, 0.8);
}

.crop-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crop-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(123, 167, 255, 0.15);
}
</style>


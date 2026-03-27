import { reactive } from 'vue'

export type CropShape = 'circle' | 'rect'

export type OpenCropperOptions = {
  title: string
  shape: CropShape
  aspectRatio?: number // only for rect
}

type Pending = {
  resolve: (url: string) => void
  reject: (err?: unknown) => void
} | null

export const cropperState = reactive({
  visible: false,
  title: '',
  shape: 'rect' as CropShape,
  aspectRatio: 16 / 10,
  // internal
  _pending: null as Pending,
})

export function openImageCropper(options: OpenCropperOptions): Promise<string> {
  if (cropperState._pending) {
    cropperState._pending.reject(new Error('cropper replaced'))
  }
  cropperState.title = options.title
  cropperState.shape = options.shape
  cropperState.aspectRatio = options.aspectRatio ?? 16 / 10
  cropperState.visible = true
  return new Promise<string>((resolve, reject) => {
    cropperState._pending = { resolve, reject }
  })
}

export function resolveImageCropper(url: string) {
  cropperState.visible = false
  cropperState._pending?.resolve(url)
  cropperState._pending = null
}

export function rejectImageCropper(err?: unknown) {
  cropperState.visible = false
  cropperState._pending?.reject(err)
  cropperState._pending = null
}


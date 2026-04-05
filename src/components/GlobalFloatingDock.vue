<template>
  <Teleport to="body">
    <aside
      v-if="showLive2dDock"
      class="global-floating-dock"
      aria-label="全局悬浮区"
    >
      <canvas ref="canvasLive2dRef"></canvas>
    </aside>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import { msg } from '@/plugins/message'
import request from '@/services/request'

(window as unknown as { PIXI: typeof PIXI }).PIXI = PIXI

const app = ref<PIXI.Application | null>(null)
/** pixi-live2d-display 类型与 PIXI.DisplayObject 不完全一致 */
const model = ref<any>(null)
const canvasLive2dRef = ref<HTMLCanvasElement | null>(null)
const showLive2dDock = ref(false)

function readStoredToken(): string | null {
  try {
    const t1 = (JSON.parse(localStorage.getItem('user-info') || '{}') as { token?: string }).token
    const t2 = (JSON.parse(sessionStorage.getItem('user-info') || '{}') as { token?: string }).token
    return t1 || t2 || null
  } catch {
    return null
  }
}

/** 当前用户模型列表中 isPresen 为展示模型的那条（接口已按 time 倒序，find 取第一条展示的） */
async function fetchDisplayModelUrl(): Promise<string | null> {
  if (!readStoredToken()) return null
  try {
    const res = (await request.get('/admin/model/list')) as { data?: unknown }
    const list = Array.isArray(res?.data) ? res.data : []
    const row = (list as Record<string, unknown>[]).find((m) => m.isPresen === true)
    const u = row?.modelUrl
    return typeof u === 'string' && u.trim() ? u.trim() : null
  } catch {
    return null
  }
}

onMounted(async () => {
  const modelUrl = await fetchDisplayModelUrl()
  if (!modelUrl) return

  showLive2dDock.value = true
  await nextTick()

  const view = canvasLive2dRef.value
  if (!view) return

  const w = 400
  const h = 400
  app.value = new PIXI.Application({
    view,
    width: w,
    height: h,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  try {
    model.value = await Live2DModel.from(modelUrl)
    app.value.stage.addChild(model.value)
    model.value.scale.set(0.08)
    model.value.anchor.set(0.6, 0.53)
    model.value.position.set(w / 2, h / 2)
  } catch {
    msg.error('[Live2D] 展示模型加载失败', { duration: 3000 })
    showLive2dDock.value = false
    try {
      app.value?.destroy(true, { children: true, texture: true })
    } catch {
      /* ignore */
    }
    app.value = null
    model.value = null
  }
})

onUnmounted(() => {
  try {
    model.value?.destroy?.()
    app.value?.destroy?.(true, { children: true, texture: true })
  } catch {
    /* ignore */
  }
})
</script>

<style scoped>
.global-floating-dock {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 10000;
  min-width: 300px;
  min-height: 300px;
  max-width: min(320px, calc(100vw - 32px));
  padding: 12px 14px;
  border-radius: 12px;
  color: #1a1a2e;
  font-size: 13px;
  line-height: 1.45;
  pointer-events: auto;
}
</style>

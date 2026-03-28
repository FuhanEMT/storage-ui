<template>
  <Teleport to="body">
    <aside class="global-floating-dock" aria-label="全局悬浮区">
      <canvas ref="canvasLive2dRef"></canvas>
    </aside>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import { msg } from '@/plugins/message'
// 注册全局 PIXI 对象
(window as any).PIXI = PIXI

// live2d 应用
const app: any = ref() as any
// 模型
const model: any = ref() as any
const canvasLive2dRef = ref<HTMLCanvasElement>()

/** public 目录在开发/构建后都挂在站点根路径，不要用 /public 前缀，也不要用相对路径 */
const NAHIDA_MODEL_URL = '/assets/live2DModel/Nahida_1080/Nahida_1080.model3.json'

onMounted(async () => {
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
    model.value = await Live2DModel.from(NAHIDA_MODEL_URL)
    app.value.stage.addChild(model.value)
    model.value.scale.set(0.08)
    model.value.anchor.set(0.6, 0.53)
    model.value.position.set(w / 2, h / 2)
  } catch (e) {
    msg.error('[Live2D] 加载失败', {
      duration: 3000,
    })
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

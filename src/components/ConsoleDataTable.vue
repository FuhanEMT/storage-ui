<template>
  <div class="cdt-root" :class="{ 'cdt-root--fill': fill }">
    <div class="cdt-inner" :style="shellStyle">
      <div class="cdt-vxe-wrap" :style="wrapMinWidthStyle">
        <vxe-grid
          :data="data"
          :columns="gridColumns"
          :height="gridHeight"
          :min-height="gridMinHeight"
          :loading="loading"
          v-bind="vxeExtraBind"
          :scroll-y="scrollYOpts"
          :scroll-x="scrollXOpts"
        >
          <!-- 将父组件传入的具名插槽原样交给 vxe-grid（与列配置 slots: { default: 'action' } 等对应） -->
          <template v-for="name in slotNames" :key="name" #[name]="scope">
            <slot :name="name" v-bind="scope ?? {}" />
          </template>
        </vxe-grid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { VxeTableDefines } from 'vxe-table'
import { computed, useSlots } from 'vue'

const slots = useSlots()
const slotNames = computed(() => Object.keys(slots) as string[])

const props = withDefaults(
  defineProps<{
    columns: VxeTableDefines.ColumnOptions<T>[]
    data: T[]
    minHeight?: number | string
    scrollX?: number | string
    fill?: boolean
    flexHeight?: boolean
    loading?: boolean
    /** 以下为 Vxe 原生能力，不设默认则不在模板里传，完全走组件库默认 */
    stripe?: boolean
    round?: boolean
    border?: boolean | 'default' | 'full' | 'outer' | 'inner' | 'none' | ''
    size?: 'medium' | 'small' | 'mini'
    showOverflow?: boolean | 'ellipsis' | 'title' | 'tooltip'
    columnResizable?: boolean
    /** 是否在首列自动插入序号列（Vxe type=seq） */
    showSeq?: boolean
    seqTitle?: string
    seqWidth?: number | string
  }>(),
  {
    minHeight: 300,
    scrollX: 980,
    fill: true,
    flexHeight: true,
    loading: false,
    showSeq: true,
    seqTitle: '序号',
    seqWidth: 56,
  },
)

const shellStyle = computed(() => {
  const mh = props.minHeight
  return { minHeight: typeof mh === 'number' ? `${mh}px` : mh }
})

const wrapMinWidthStyle = computed(() => {
  const x = props.scrollX
  return { minWidth: typeof x === 'number' ? `${x}px` : x }
})

const gridHeight = computed(() => (props.flexHeight ? '100%' : undefined))
const gridMinHeight = computed(() => {
  if (props.flexHeight) return undefined
  const mh = props.minHeight
  return typeof mh === 'number' ? mh : mh
})

const vxeExtraBind = computed(() => {
  const o: Record<string, unknown> = {}
  if (props.stripe !== undefined) o.stripe = props.stripe
  if (props.round !== undefined) o.round = props.round
  if (props.border !== undefined) o.border = props.border
  if (props.size !== undefined) o.size = props.size
  if (props.showOverflow !== undefined) o.showOverflow = props.showOverflow
  if (props.columnResizable !== undefined) o.columnConfig = { resizable: props.columnResizable }
  return o
})

const scrollYOpts = computed(() => ({ enabled: props.flexHeight }))
const scrollXOpts = computed(() => ({ enabled: true }))

const gridColumns = computed((): VxeTableDefines.ColumnOptions<T>[] => {
  if (!props.showSeq) return props.columns
  const seq: VxeTableDefines.ColumnOptions<T> = {
    type: 'seq',
    title: props.seqTitle,
    width: props.seqWidth,
    align: 'center',
  }
  return [seq, ...props.columns]
})
</script>

<style scoped>
/* 仅保留布局，不覆盖 Vxe 默认皮肤 */
.cdt-root {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cdt-root--fill {
  flex: 1;
  min-height: 0;
}

.cdt-inner {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.cdt-vxe-wrap {
  flex: 1;
  min-height: 0;
}
</style>

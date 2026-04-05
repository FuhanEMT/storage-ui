import type { VxeTableDefines } from 'vxe-table'
import { h } from 'vue'
import { NButton, NPopconfirm } from 'naive-ui'

/** 操作列按钮：纯数据配置 + onClick，由 `consoleActionButtonsColumn` 渲染为 Naive 按钮 / 确认框 */
export type ConsoleActionButton<T extends Record<string, unknown>> = {
  text: string
  type?: 'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  quaternary?: boolean
  size?: 'tiny' | 'small' | 'medium' | 'large'
  /** 有值则用 `NPopconfirm` 包裹，确认后执行 onClick */
  confirmText?: string
  loading?: (row: T) => boolean
  /** 返回 `false` 时不渲染该按钮；缺省视为始终展示 */
  display?: (row: T) => boolean
  /**
   * 无 confirm：点击即触发。
   * 有 confirm：点确定后触发；返回 `false` 时尽量阻止弹层关闭（视 Naive 版本而定）。
   */
  onClick: (row: T) => void | boolean | Promise<void | boolean>
}

function renderActionCell<T extends Record<string, unknown>>(row: T, buttons: ConsoleActionButton<T>[]) {
  return h(
    'div',
    {
      class: 'console-table-action-cell',
      style: {
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      },
    },
    buttons.flatMap((btn) => {
      if (typeof btn.display === 'function' && !btn.display(row)) return []

      const size = btn.size ?? 'small'
      const quaternary = btn.quaternary ?? true
      const type = btn.type ?? 'default'
      const loading = btn.loading?.(row) ?? false

      const run = () => btn.onClick(row as T)

      if (btn.confirmText) {
        return [
          h(
            NPopconfirm,
            {
              onPositiveClick: async () => {
                const r = await run()
                return r !== false
              },
            },
            {
              trigger: () =>
                h(
                  NButton,
                  { type, size, quaternary, loading },
                  { default: () => btn.text },
                ),
              default: () => btn.confirmText,
            },
          ),
        ]
      }

      return [
        h(
          NButton,
          {
            type,
            size,
            quaternary,
            loading,
            onClick: () => {
              void run()
            },
          },
          { default: () => btn.text },
        ),
      ]
    }),
  )
}

/**
 * 操作列：在列配置的 `slots.default` 里按 `buttons` 渲染按钮，无需在模板里写 `#action`。
 */
export function consoleActionButtonsColumn<T extends Record<string, unknown>>(
  title: string,
  buttons: ConsoleActionButton<T>[],
  options?: { width?: number | string; field?: string },
): VxeTableDefines.ColumnOptions<T> {
  const field = (options?.field ?? 'action') as keyof T & string
  return {
    field,
    title,
    width: options?.width ?? 200,
    align: 'center',
    slots: {
      default({ row }) {
        return renderActionCell(row as T, buttons)
      },
    },
  }
}

/** 与 `ConsoleDataTable`（VxeGrid）配套：布尔列「是/否」（默认单元格样式） */
export function consoleBooleanColumn<T extends Record<string, unknown>>(
  field: keyof T & string,
  title: string,
  options?: { width?: number | string; trueText?: string; falseText?: string },
): VxeTableDefines.ColumnOptions<T> {
  const width = options?.width ?? 130
  const trueText = options?.trueText ?? '是'
  const falseText = options?.falseText ?? '否'
  return {
    field,
    title,
    width,
    align: 'center',
    slots: {
      default({ row }) {
        return !!row[field] ? trueText : falseText
      },
    },
  }
}

export type ConsoleTableColumn<T extends Record<string, unknown> = Record<string, unknown>> =
  VxeTableDefines.ColumnOptions<T>

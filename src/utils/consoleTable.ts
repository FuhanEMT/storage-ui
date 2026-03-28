import type { VxeTableDefines } from 'vxe-table'

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

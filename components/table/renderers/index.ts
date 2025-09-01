import { ColumnRenderer, Column } from '@/lib/types'

// === Pure Config-Driven Renderer System ===
// NO built-in renderers - everything must come from config

// Empty registry - all renderers must be provided by config
export const builtInRenderers = new Map<string, ColumnRenderer<unknown>>()

// Renderer resolver - ONLY uses config renderers
export const getRenderer = (type: string, customRenderers?: Map<string, ColumnRenderer<unknown>>): ColumnRenderer<unknown> | undefined => 
  customRenderers?.get(type)

// Helper for creating strongly-typed custom renderers
export const createRenderer = <T = unknown>(
  type: string,
  component: React.ComponentType<import('@/lib/types').CellRendererProps<T>>,
  validate: (value: unknown, column: Column) => T,
  defaultValue: T
): ColumnRenderer<T> => ({
  type,
  component,
  validate,
  defaultValue
})

// Get default value for column type
export const getDefaultValue = (column: Column, customRenderers?: Map<string, ColumnRenderer<unknown>>): unknown => {
  const renderer = getRenderer(column.type, customRenderers)
  return renderer?.defaultValue ?? null
}

// Validate cell value using column's renderer
export const validateCellValue = (value: unknown, column: Column, customRenderers?: Map<string, ColumnRenderer<unknown>>): unknown => {
  const renderer = getRenderer(column.type, customRenderers)
  return renderer?.validate ? renderer.validate(value, column) : value
}
import { z } from 'zod'

// === Core ID Types with Branding ===
export const TableId = z.string().brand('TableId')
export const ColumnId = z.string().brand('ColumnId') 
export const RowId = z.string().brand('RowId')
export const CellId = z.string().brand('CellId')

export type TableId = z.infer<typeof TableId>
export type ColumnId = z.infer<typeof ColumnId>
export type RowId = z.infer<typeof RowId>
export type CellId = z.infer<typeof CellId>

// === Base Column Schema ===
const BaseColumnSchema = z.object({
  id: ColumnId,
  tableId: TableId,
  name: z.string().min(1),
  width: z.number().min(50).max(800).default(200),
  position: z.number().min(0),
  required: z.boolean().default(false),
  readonly: z.boolean().default(false),
})

// === Column Type Definitions ===
export const TextColumnSchema = BaseColumnSchema.extend({
  type: z.literal('text'),
  config: z.object({
    placeholder: z.string().optional(),
    maxLength: z.number().optional(),
    multiline: z.boolean().default(false),
  }).default({}),
})

export const NumberColumnSchema = BaseColumnSchema.extend({
  type: z.literal('number'),
  config: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().default(1),
    precision: z.number().optional(),
    format: z.enum(['decimal', 'currency', 'percentage']).default('decimal'),
  }).default({}),
})

export const SelectColumnSchema = BaseColumnSchema.extend({
  type: z.literal('select'),
  config: z.object({
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
      color: z.string().optional(),
    })).min(1),
    multiple: z.boolean().default(false),
  }),
})

export const DateColumnSchema = BaseColumnSchema.extend({
  type: z.literal('date'),
  config: z.object({
    format: z.enum(['date', 'datetime', 'time']).default('date'),
    min: z.string().optional(),
    max: z.string().optional(),
  }).default({}),
})

export const BooleanColumnSchema = BaseColumnSchema.extend({
  type: z.literal('boolean'),
  config: z.object({
    trueLabel: z.string().default('Yes'),
    falseLabel: z.string().default('No'),
  }).default({}),
})

export const CustomColumnSchema = BaseColumnSchema.extend({
  type: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
})

// === Union Column Type ===
// Allow any string type to support full extensibility
export const ColumnSchema = BaseColumnSchema.extend({
  type: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
})

export type Column = z.infer<typeof ColumnSchema>
export type TextColumn = z.infer<typeof TextColumnSchema>
export type NumberColumn = z.infer<typeof NumberColumnSchema>
export type SelectColumn = z.infer<typeof SelectColumnSchema>
export type DateColumn = z.infer<typeof DateColumnSchema>
export type BooleanColumn = z.infer<typeof BooleanColumnSchema>
export type CustomColumn = z.infer<typeof CustomColumnSchema>

// === Cell Renderer Props ===
export interface CellRendererProps<T> {
  value: T
  onChange: (value: T) => void
  column: Column
  readonly: boolean
  editing: boolean
}

// === Column Renderer Definition ===
export interface ColumnRenderer<T> {
  type: string
  component: React.ComponentType<CellRendererProps<T>>
  validate: (value: unknown, column: Column) => T
  defaultValue: T
}

// === Entity Schemas ===
export const TableSchema = z.object({
  id: TableId,
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const RowSchema = z.object({
  id: RowId,
  tableId: TableId,
  position: z.number().min(0),
  selected: z.boolean().default(false),
  createdAt: z.date(),
})

export const CellSchema = z.object({
  id: CellId,
  rowId: RowId,
  columnId: ColumnId,
  value: z.unknown(),
  updatedAt: z.date(),
})

export const TableOptionsSchema = z.object({
  showRowNumbers: z.boolean().default(true),
  showSelectAll: z.boolean().default(true),
  enableSelection: z.boolean().default(true),
  enableEditing: z.boolean().default(true),
  columnSizing: z.enum(['fixed', 'auto', 'balanced']).default('balanced'),
  minColumnWidth: z.number().min(50).default(80),
  maxColumnWidth: z.number().max(1000).default(400),
  density: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
  striped: z.boolean().default(false),
})

export const TableSelectionSchema = z.object({
  selectedRows: z.set(RowId),
  selectedColumns: z.set(ColumnId),
  selectedCells: z.set(CellId),
  isAllSelected: z.boolean().default(false),
})

// === Inferred Types ===
export type Table = z.infer<typeof TableSchema>
export type Row = z.infer<typeof RowSchema>
export type Cell = z.infer<typeof CellSchema>
export type TableOptions = z.infer<typeof TableOptionsSchema>
export type TableSelection = z.infer<typeof TableSelectionSchema>
export type ColumnSizingMode = TableOptions['columnSizing']

// === Validation Functions ===
export const validateColumn = (data: unknown): Column => ColumnSchema.parse(data)
export const validateTable = (data: unknown): Table => TableSchema.parse(data)
export const validateOptions = (data: unknown): TableOptions => TableOptionsSchema.parse(data)

// === ID Creators ===
export const createTableId = (id: string): TableId => TableId.parse(id)
export const createColumnId = (id: string): ColumnId => ColumnId.parse(id)
export const createRowId = (id: string): RowId => RowId.parse(id)
export const createCellId = (id: string): CellId => CellId.parse(id)
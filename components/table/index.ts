// Table components export barrel
export { TableEditor } from './table-editor'
export { TableHeader } from './table-header'
export { TableRow } from './table-row'
export { TableCell } from './table-cell'
export { TableRowNumber } from './table-row-number'
export { TableSelectAll } from './table-select-all'

// Re-export types for convenience
export type {
  Table,
  Column,
  Row,
  Cell,
  TableSelection,
  TableOptions,
  ColumnType,
  TableId,
  ColumnId,
  RowId,
  CellId,
} from '@/lib/types'
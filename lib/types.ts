// Core table types
export type ColumnType = 'text' | 'number' | 'date' | 'select'

export interface TableId {
  readonly brand: unique symbol
  readonly value: string
}

export interface ColumnId {
  readonly brand: unique symbol
  readonly value: string
}

export interface RowId {
  readonly brand: unique symbol
  readonly value: string
}

export interface CellId {
  readonly brand: unique symbol
  readonly value: string
}

// Helper functions to create branded IDs
export const createTableId = (value: string): TableId => ({ value } as TableId)
export const createColumnId = (value: string): ColumnId => ({ value } as ColumnId)
export const createRowId = (value: string): RowId => ({ value } as RowId)
export const createCellId = (value: string): CellId => ({ value } as CellId)

// Core entities
export interface Table {
  readonly id: TableId
  readonly name: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface Column {
  readonly id: ColumnId
  readonly tableId: TableId
  readonly name: string
  readonly type: ColumnType
  readonly width: number
  readonly position: number
  readonly isRequired: boolean
  readonly defaultValue?: unknown
}

export interface Row {
  readonly id: RowId
  readonly tableId: TableId
  readonly position: number
  readonly isSelected: boolean
  readonly createdAt: Date
}

export interface Cell {
  readonly id: CellId
  readonly rowId: RowId
  readonly columnId: ColumnId
  readonly value: unknown
  readonly updatedAt: Date
}

// UI state types
export interface TableSelection {
  readonly selectedRows: Set<RowId>
  readonly selectedColumns: Set<ColumnId>
  readonly selectedCells: Set<CellId>
  readonly isAllSelected: boolean
}

export interface TableOptions {
  readonly showRowNumbers: boolean
  readonly showSelectAll: boolean
  readonly enableSelection: boolean
  readonly enableEditing: boolean
}

// Cell rendering types
export interface CellProps {
  readonly cell: Cell
  readonly column: Column
  readonly row: Row
  readonly isSelected: boolean
  readonly isEditing: boolean
  readonly onValueChange: (value: unknown) => void
  readonly onEditStart: () => void
  readonly onEditEnd: () => void
}

// Table event types
export interface TableEvents {
  readonly onCellChange: (cellId: CellId, value: unknown) => void
  readonly onRowSelect: (rowId: RowId, selected: boolean) => void
  readonly onColumnSelect: (columnId: ColumnId, selected: boolean) => void
  readonly onSelectAll: (selected: boolean) => void
}
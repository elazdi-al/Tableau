import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { enableMapSet } from 'immer'

// Enable Map/Set support in Immer
enableMapSet()
import {
  Table, Column, Row, Cell, TableSelection, TableOptions,
  TableId, ColumnId, RowId, CellId,
  createTableId, createColumnId, createRowId, createCellId
} from './types'

interface DatabaseState {
  // Data
  readonly tables: Map<TableId, Table>
  readonly columns: Map<ColumnId, Column>
  readonly rows: Map<RowId, Row>
  readonly cells: Map<CellId, Cell>
  
  // UI State
  readonly selection: TableSelection
  readonly options: TableOptions
  
  // Core Actions
  readonly addTable: (table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>) => TableId
  readonly addColumn: (column: Omit<Column, 'id'>) => ColumnId
  readonly addRow: (row: Omit<Row, 'id' | 'createdAt' | 'isSelected'>) => RowId
  readonly updateCell: (cellId: CellId, value: unknown) => void
  readonly createCell: (rowId: RowId, columnId: ColumnId, value: unknown) => CellId
  
  // Selection Actions
  readonly toggleRowSelection: (rowId: RowId) => void
  readonly toggleSelectAll: () => void
  readonly clearSelection: () => void
  
  // Query Actions
  readonly getTableColumns: (tableId: TableId) => Column[]
  readonly getTableRows: (tableId: TableId) => Row[]
  readonly getCell: (rowId: RowId, columnId: ColumnId) => Cell | undefined
  readonly getCellValue: (rowId: RowId, columnId: ColumnId) => unknown
}

export const useDatabase = create<DatabaseState>()(
  devtools(
    immer((set, get) => ({
      tables: new Map(),
      columns: new Map(),
      rows: new Map(),
      cells: new Map(),
      
      selection: {
        selectedRows: new Set(),
        selectedColumns: new Set(),
        selectedCells: new Set(),
        isAllSelected: false,
      },
      
      options: {
        showRowNumbers: true,
        showSelectAll: true,
        enableSelection: true,
        enableEditing: true,
      },
      
      addTable: (tableData) => {
        const id = createTableId(`table-${Date.now()}`)
        const now = new Date()
        
        set((state) => {
          state.tables.set(id, {
            id,
            ...tableData,
            createdAt: now,
            updatedAt: now,
          })
        })
        
        return id
      },
      
      addColumn: (columnData) => {
        const id = createColumnId(`col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
        
        set((state) => {
          state.columns.set(id, { id, ...columnData })
        })
        
        return id
      },
      
      addRow: (rowData) => {
        const id = createRowId(`row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
        const now = new Date()
        
        set((state) => {
          state.rows.set(id, {
            id,
            ...rowData,
            isSelected: false,
            createdAt: now,
          })
        })
        
        return id
      },
      
      createCell: (rowId, columnId, value) => {
        const id = createCellId(`${rowId.value}-${columnId.value}`)
        const now = new Date()
        
        set((state) => {
          state.cells.set(id, {
            id,
            rowId,
            columnId,
            value,
            updatedAt: now,
          })
        })
        
        return id
      },
      
      updateCell: (cellId, value) => {
        set((state) => {
          const cell = state.cells.get(cellId)
          if (cell) {
            state.cells.set(cellId, {
              ...cell,
              value,
              updatedAt: new Date(),
            })
          }
        })
      },
      
      toggleRowSelection: (rowId) => {
        set((state) => {
          const row = state.rows.get(rowId)
          if (row) {
            const newSelected = !row.isSelected
            state.rows.set(rowId, { ...row, isSelected: newSelected })
            
            if (newSelected) {
              state.selection.selectedRows.add(rowId)
            } else {
              state.selection.selectedRows.delete(rowId)
              state.selection.isAllSelected = false
            }
          }
        })
      },
      
      toggleSelectAll: () => {
        set((state) => {
          const allSelected = state.selection.isAllSelected
          state.selection.isAllSelected = !allSelected
          
          if (!allSelected) {
            // Select all rows
            for (const [rowId, row] of state.rows) {
              state.rows.set(rowId, { ...row, isSelected: true })
              state.selection.selectedRows.add(rowId)
            }
          } else {
            // Deselect all rows
            for (const [rowId, row] of state.rows) {
              state.rows.set(rowId, { ...row, isSelected: false })
            }
            state.selection.selectedRows.clear()
          }
        })
      },
      
      clearSelection: () => {
        set((state) => {
          state.selection.selectedRows.clear()
          state.selection.selectedColumns.clear()
          state.selection.selectedCells.clear()
          state.selection.isAllSelected = false
          
          for (const [rowId, row] of state.rows) {
            state.rows.set(rowId, { ...row, isSelected: false })
          }
        })
      },
      
      getTableColumns: (tableId) => {
        const { columns } = get()
        return Array.from(columns.values())
          .filter(col => col.tableId.value === tableId.value)
          .sort((a, b) => a.position - b.position)
      },
      
      getTableRows: (tableId) => {
        const { rows } = get()
        return Array.from(rows.values())
          .filter(row => row.tableId.value === tableId.value)
          .sort((a, b) => a.position - b.position)
      },
      
      getCell: (rowId, columnId) => {
        const { cells } = get()
        return Array.from(cells.values()).find(
          cell => cell.rowId.value === rowId.value && cell.columnId.value === columnId.value
        )
      },
      
      getCellValue: (rowId, columnId) => {
        const cell = get().getCell(rowId, columnId)
        return cell?.value
      },
    })),
    { name: 'tableau-db' }
  )
)

// Initialize with sample data
export const initializeSampleData = () => {
  const store = useDatabase.getState()
  
  const tableId = store.addTable({ name: 'Sample Table' })
  
  const nameColId = store.addColumn({ 
    tableId, 
    name: 'Name', 
    type: 'text', 
    width: 200, 
    position: 0, 
    isRequired: false 
  })
  
  const ageColId = store.addColumn({ 
    tableId, 
    name: 'Age', 
    type: 'number', 
    width: 100, 
    position: 1, 
    isRequired: false 
  })
  
  const emailColId = store.addColumn({ 
    tableId, 
    name: 'Email', 
    type: 'text', 
    width: 250, 
    position: 2, 
    isRequired: false 
  })
  
  const sampleData = [
    ['Alice Johnson', 28, 'alice@example.com'],
    ['Bob Smith', 34, 'bob@example.com'],
    ['Carol Davis', 25, 'carol@example.com']
  ]
  
  sampleData.forEach((rowData, index) => {
    const rowId = store.addRow({ tableId, position: index })
    
    store.createCell(rowId, nameColId, rowData[0])
    store.createCell(rowId, ageColId, rowData[1])
    store.createCell(rowId, emailColId, rowData[2])
  })
  
  return tableId
}
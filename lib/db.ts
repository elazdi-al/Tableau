import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { enableMapSet } from "immer";
import {
  Table,
  Column,
  Row,
  Cell,
  TableSelection,
  TableOptions,
  TableId,
  ColumnId,
  RowId,
  CellId,
  createTableId,
  createColumnId,
  createRowId,
  createCellId,
  validateColumn,
  validateTable,
} from "./types";
import { validateCellValue } from "@/components/table/renderers";

// Enable Map/Set support in Immer
enableMapSet();

interface DatabaseState {
  // Data
  readonly tables: Map<TableId, Table>;
  readonly columns: Map<ColumnId, Column>;
  readonly rows: Map<RowId, Row>;
  readonly cells: Map<CellId, Cell>;

  // UI State
  readonly selection: TableSelection;
  readonly options: TableOptions;

  // Core Actions
  readonly addTable: (
    table: Omit<Table, "id" | "createdAt" | "updatedAt">,
  ) => TableId;
  readonly addColumn: (column: Omit<Column, "id">) => ColumnId;
  readonly addRow: (row: Omit<Row, "id" | "createdAt" | "selected">) => RowId;
  readonly duplicateRow: (rowId: RowId) => RowId | null;
  readonly deleteRow: (rowId: RowId) => void;
  readonly updateCell: (cellId: CellId, value: unknown) => void;
  readonly createCell: (
    rowId: RowId,
    columnId: ColumnId,
    value: unknown,
  ) => CellId;
  readonly setOptions: (options: Partial<TableOptions>) => void;

  // Selection Actions
  readonly toggleRowSelection: (rowId: RowId) => void;
  readonly toggleSelectAll: () => void;
  readonly clearSelection: () => void;

  // Query Actions
  readonly getTableColumns: (tableId: TableId) => Column[];
  readonly getTableRows: (tableId: TableId) => Row[];
  readonly getCell: (rowId: RowId, columnId: ColumnId) => Cell | undefined;
  readonly getCellValue: (rowId: RowId, columnId: ColumnId) => unknown;
  readonly getTable: (tableId: TableId) => Table | undefined;

  // Bulk Operations
  readonly addColumns: (columns: Omit<Column, "id">[]) => ColumnId[];
  readonly addRows: (
    rows: Omit<Row, "id" | "createdAt" | "selected">[],
  ) => RowId[];
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
        columnSizing: "balanced",
        minColumnWidth: 80,
        maxColumnWidth: 400,
        density: "normal",
        striped: false,
      },

      addTable: (tableData) => {
        const id = createTableId(`table-${Date.now()}`);
        const now = new Date();

        set((state) => {
          const table = validateTable({
            id,
            ...tableData,
            createdAt: now,
            updatedAt: now,
          });
          state.tables.set(id, table);
        });

        return id;
      },

      addColumn: (columnData) => {
        const id = createColumnId(
          `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        );

        set((state) => {
          const column = validateColumn({ id, ...columnData });
          state.columns.set(id, column);
        });

        return id;
      },

      addColumns: (columnsData) => {
        const ids: ColumnId[] = [];

        set((state) => {
          columnsData.forEach((columnData) => {
            const id = createColumnId(
              `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            );
            const column = validateColumn({ id, ...columnData });
            state.columns.set(id, column);
            ids.push(id);
          });
        });

        return ids;
      },

      addRow: (rowData) => {
        const id = createRowId(
          `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        );
        const now = new Date();

        set((state) => {
          state.rows.set(id, {
            id,
            ...rowData,
            selected: false,
            createdAt: now,
          });
        });

        return id;
      },

      addRows: (rowsData) => {
        const ids: RowId[] = [];
        const now = new Date();

        set((state) => {
          rowsData.forEach((rowData) => {
            const id = createRowId(
              `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            );
            state.rows.set(id, {
              id,
              ...rowData,
              selected: false,
              createdAt: now,
            });
            ids.push(id);
          });
        });

        return ids;
      },

      duplicateRow: (rowId) => {
        const { rows, cells, getTableColumns, createCell } = get();
        const originalRow = rows.get(rowId);

        if (!originalRow) return null;

        // Create new row with incremented position
        const maxPosition = Math.max(
          ...Array.from(rows.values())
            .filter((r) => r.tableId === originalRow.tableId)
            .map((r) => r.position),
        );

        const newRowId = get().addRow({
          tableId: originalRow.tableId,
          position: maxPosition + 1,
        });

        // Copy all cells from original row
        const columns = getTableColumns(originalRow.tableId);
        columns.forEach((column) => {
          const originalCell = Array.from(cells.values()).find(
            (cell) => cell.rowId === rowId && cell.columnId === column.id,
          );
          if (originalCell) {
            createCell(newRowId, column.id, originalCell.value);
          }
        });

        return newRowId;
      },

      deleteRow: (rowId) => {
        set((state) => {
          // Remove the row
          state.rows.delete(rowId);

          // Remove all cells associated with this row
          const cellsToDelete = Array.from(state.cells.entries())
            .filter(([_, cell]) => cell.rowId === rowId)
            .map(([cellId]) => cellId);

          cellsToDelete.forEach((cellId) => state.cells.delete(cellId));

          // Remove from selection
          state.selection.selectedRows.delete(rowId);

          // Update positions of remaining rows
          const remainingRows = Array.from(state.rows.values())
            .filter((row) => row.tableId === state.rows.get(rowId)?.tableId)
            .sort((a, b) => a.position - b.position);

          remainingRows.forEach((row, index) => {
            state.rows.set(row.id, { ...row, position: index });
          });
        });
      },

      createCell: (rowId, columnId, value) => {
        const id = createCellId(`${rowId}-${columnId}`);
        const now = new Date();

        set((state) => {
          state.cells.set(id, {
            id,
            rowId,
            columnId,
            value: value, // Store raw value, validation will be handled by renderers
            updatedAt: now,
          });
        });

        return id;
      },

      updateCell: (cellId, value) => {
        set((state) => {
          const cell = state.cells.get(cellId);
          if (cell) {
            state.cells.set(cellId, {
              ...cell,
              value: value, // Store raw value, validation will be handled by renderers
              updatedAt: new Date(),
            });
          }
        });
      },

      setOptions: (newOptions) => {
        set((state) => {
          state.options = { ...state.options, ...newOptions };
        });
      },

      toggleRowSelection: (rowId) => {
        set((state) => {
          const row = state.rows.get(rowId);
          if (row) {
            const newSelected = !row.selected;
            state.rows.set(rowId, { ...row, selected: newSelected });

            if (newSelected) {
              state.selection.selectedRows.add(rowId);
            } else {
              state.selection.selectedRows.delete(rowId);
              state.selection.isAllSelected = false;
            }
          }
        });
      },

      toggleSelectAll: () => {
        set((state) => {
          const allSelected = state.selection.isAllSelected;
          state.selection.isAllSelected = !allSelected;

          if (!allSelected) {
            // Select all rows
            for (const [rowId, row] of state.rows) {
              state.rows.set(rowId, { ...row, selected: true });
              state.selection.selectedRows.add(rowId);
            }
          } else {
            // Deselect all rows
            for (const [rowId, row] of state.rows) {
              state.rows.set(rowId, { ...row, selected: false });
            }
            state.selection.selectedRows.clear();
          }
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selection.selectedRows.clear();
          state.selection.selectedColumns.clear();
          state.selection.selectedCells.clear();
          state.selection.isAllSelected = false;

          for (const [rowId, row] of state.rows) {
            state.rows.set(rowId, { ...row, selected: false });
          }
        });
      },

      getTableColumns: (tableId) => {
        const { columns } = get();
        return Array.from(columns.values())
          .filter((col) => col.tableId === tableId)
          .sort((a, b) => a.position - b.position);
      },

      getTableRows: (tableId) => {
        const { rows } = get();
        return Array.from(rows.values())
          .filter((row) => row.tableId === tableId)
          .sort((a, b) => a.position - b.position);
      },

      getCell: (rowId, columnId) => {
        const { cells } = get();
        return Array.from(cells.values()).find(
          (cell) => cell.rowId === rowId && cell.columnId === columnId,
        );
      },

      getCellValue: (rowId, columnId) => {
        const cell = get().getCell(rowId, columnId);
        return cell?.value;
      },

      getTable: (tableId) => {
        return get().tables.get(tableId);
      },
    })),
    { name: "tableau-db" },
  ),
);

// Initialize with sample data using custom column types
export const initializeSampleData = () => {
  const store = useDatabase.getState();

  const tableId = store.addTable({ name: "Sample Table" });

  // Add columns using proper config-driven types
  const columns = [
    {
      tableId,
      name: "Name",
      type: "text",
      width: 200,
      position: 0,
      required: false,
      readonly: false,
      config: { placeholder: "Enter name...", multiline: false },
      alignment: "left",
      headerAlignment: "left",
    },
    {
      tableId,
      name: "Age",
      type: "number",
      width: 100,
      position: 1,
      required: false,
      readonly: false,
      config: { min: 0, max: 120, step: 1, format: "decimal" },
      alignment: "right",
      headerAlignment: "right",
    },
    {
      tableId,
      name: "Status",
      type: "text",
      width: 150,
      position: 2,
      required: false,
      readonly: false,
      config: { placeholder: "Enter status...", multiline: false },
      alignment: "left",
      headerAlignment: "left",
    },
  ];

  const columnIds = store.addColumns(columns);

  const sampleData = [
    ["Alice Johnson", 28, "Active"],
    ["Bob Smith", 34, "Inactive"],
    ["Carol Davis", 25, "Pending"],
  ];

  sampleData.forEach((rowData, index) => {
    const rowId = store.addRow({ tableId, position: index });

    columnIds.forEach((colId, colIndex) => {
      store.createCell(rowId, colId, rowData[colIndex]);
    });
  });

  return tableId;
};

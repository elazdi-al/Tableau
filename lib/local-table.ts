import { createDefaultRendererRegistry as createRendererRegistryFromComponents } from "@/components/table/renderers";
import { and, createCollection, eq, localStorageCollectionOptions } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type VisibilityState
} from "@tanstack/react-table";
import { useMemo, useState, useEffect } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    Column,
    ColumnSchema,
    LocalTableRow,
    RendererRegistry,
    Row,
    RowSchema,
    Table,
    TableSchema
} from "./types";

// Re-export types for convenience
export type { Column, LocalTableRow, Row, Table };

// Create default renderer registry
export const createDefaultRendererRegistry = (): RendererRegistry => {
  return createRendererRegistryFromComponents();
};

const userId = "local-user"
const tableId = "local-table"

// === Collections Setup ===
export const tablesCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "tables",
    getKey: (item: Table) => item.id,
    schema: TableSchema,
  })
);

export const columnsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "columns",
    getKey: (item: Column) => item.id,
    schema: ColumnSchema,
  })
);

export const rowsCollection = createCollection(
  localStorageCollectionOptions({
    storageKey: "rows",
    getKey: (item: Row) => item.id,
    schema: RowSchema,
  })
);

// === Zustand Store for Collection Management ===
interface CollectionStore {
  // State
  selectedTableId: string | null;
  isInitialized: boolean;

  // Actions
  setSelectedTable: (tableId: string | null) => void;
  initialize: () => void;

  // Table operations
  createTable: (name: string) => string;
  deleteTable: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;

  // Column operations
  createColumn: (tableId: string, name: string, type?: Column["type"]) => string;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  reorderColumns: (tableId: string, columnIds: string[]) => void;

  // Row operations
  createRow: (tableId: string, data?: Record<string, unknown>) => string;
  deleteRow: (rowId: string) => void;
  updateRow: (rowId: string, updates: Partial<Row>) => void;
  updateCellValue: (rowId: string, columnId: string, value: unknown) => void;
  reorderRows: (tableId: string, rowIds: string[]) => void;
}

export const useCollectionStore = create<CollectionStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // State
      selectedTableId: null,
      isInitialized: false,

      // Actions
      setSelectedTable: (tableId) => {
        set((state) => {
          state.selectedTableId = tableId;
        });
      },

      initialize: () => {
        set((state) => {
          state.isInitialized = true;
        });
      },

      // Table operations
      createTable: (name) => {
        const table: Table = {
          id: tableId,
          name,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        tablesCollection.insert(table);
        return table.id;
      },

      deleteTable: (tableId) => {
        // Delete associated columns and rows
        const columns = columnsCollection.state.values();
        const rows = rowsCollection.state.values();

        for (const column of columns) {
          if (column.tableId === tableId) {
            columnsCollection.delete(column.id);
          }
        }

        for (const row of rows) {
          if (row.tableId === tableId) {
            rowsCollection.delete(row.id);
          }
        }

        tablesCollection.delete(tableId);

        set((state) => {
          if (state.selectedTableId === tableId) {
            state.selectedTableId = null;
          }
        });
      },

      updateTable: (tableId, updates) => {
        tablesCollection.update(tableId, (draft) => {
          Object.assign(draft, updates, { updatedAt: new Date() });
        });
      },

      // Column operations
      createColumn: (tableId, name, type = "text") => {
        const existingColumns = Array.from(columnsCollection.state.values())
          .filter(col => col.tableId === tableId);

        const column: Column = {
          id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tableId,
          name,
          type,
          width: 200,
          position: existingColumns.length,
          userId: userId,
        };

        columnsCollection.insert(column);
        return column.id;
      },

      deleteColumn: (columnId) => {
        const column = columnsCollection.state.get(columnId);
        if (!column) return;

        // Remove column data from all rows
        const rows = Array.from(rowsCollection.state.values())
          .filter(row => row.tableId === column.tableId);

        for (const row of rows) {
          if (row.data[columnId] !== undefined) {
            const { [columnId]: removed, ...newData } = row.data;
            rowsCollection.update(row.id, (draft) => {
              draft.data = newData;
            });
          }
        }

        columnsCollection.delete(columnId);
      },

      updateColumn: (columnId, updates) => {
        columnsCollection.update(columnId, (draft) => {
          Object.assign(draft, updates);
        });
      },

      reorderColumns: (tableId, columnIds) => {
        columnIds.forEach((columnId, index) => {
          columnsCollection.update(columnId, (draft) => {
            draft.position = index;
          });
        });
      },

      // Row operations
      createRow: (tableId, data = {}) => {
        const existingRows = Array.from(rowsCollection.state.values())
          .filter(row => row.tableId === tableId);

        const row: Row = {
          id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tableId,
          position: existingRows.length,
          data,
          userId: userId,
          createdAt: new Date(),
        };

        rowsCollection.insert(row);
        return row.id;
      },

      deleteRow: (rowId) => {
        rowsCollection.delete(rowId);
      },

      updateRow: (rowId, updates) => {
        rowsCollection.update(rowId, (draft) => {
          Object.assign(draft, updates);
        });
      },

      updateCellValue: (rowId, columnId, value) => {
        rowsCollection.update(rowId, (draft) => {
          draft.data[columnId] = value;
        });
      },

      reorderRows: (tableId, rowIds) => {
        rowIds.forEach((rowId, index) => {
          rowsCollection.update(rowId, (draft) => {
            draft.position = index;
          });
        });
      },
    }))
  )
);

// === Live Query Hooks ===
export const useTables = () => {
  return useLiveQuery((q) =>
    q.from({ table: tablesCollection })
      .where(({ table }) => eq(table.userId, userId))
      .orderBy(({ table }) => table.createdAt)
  );
};

export const useTable = (tableId: string | null) => {
  return useLiveQuery((q) =>
    q.from({ table: tablesCollection })
     .where(({ table }) => and(eq(table.id, tableId), eq(table.userId, userId)))
  );
};

export const useTableColumns = (tableId: string) => {
  return useLiveQuery((q) =>
    q.from({ column: columnsCollection })
     .where(({ column }) => and(eq(column.tableId, tableId), eq(column.userId, userId)))
     .orderBy(({ column }) => column.position)
  );
};

export const useTableRows = (tableId: string) => {
  return useLiveQuery((q) =>
    q.from({ row: rowsCollection })
     .where(({ row }) => and(eq(row.tableId, tableId), eq(row.userId, userId)))
     .orderBy(({ row }) => row.position)
  );
};

export const useColumnsByTable = () => {
  return useLiveQuery((q) =>
    q.from({ column: columnsCollection })
     .where(({ column }) => eq(column.userId, userId))
     .orderBy(({ column }) => column.tableId)
     .orderBy(({ column }) => column.position)
  );
};

export const useRowsByTable = () => {
  return useLiveQuery((q) =>
    q.from({ row: rowsCollection })
     .where(({ row }) => eq(row.userId, userId))
     .orderBy(({ row }) => row.tableId)
     .orderBy(({ row }) => row.position)
  );
};

// === TanStack Table Integration ===
export interface UseLocalTableOptions {
  initialPageSize?: number;
}

export const useLocalTable = ({ initialPageSize = 10 }: UseLocalTableOptions) => {
  const store = useCollectionStore();

  // Initialize sample data if no tables exist
  useEffect(() => {
    const existingTables = Array.from(tablesCollection.state.values());
    if (existingTables.length === 0) {
      initializeSampleData();
    }
  }, []);

  // State for table controls
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  // Live queries for reactive data
  const { data: columns } = useTableColumns(tableId);
  const { data: rows } = useTableRows(tableId);

  // Transform columns for TanStack Table
  const tableColumns = useMemo<ColumnDef<LocalTableRow>[]>(() =>
    columns.map((col): ColumnDef<LocalTableRow> => ({
      id: col.id,
      accessorKey: col.id,
      header: col.name,
      size: col.width,
      cell: ({ getValue }) => {
        const value = getValue();

        switch (col.type) {
          case "boolean":
            return value ? "✓" : "✗";
          case "date":
            return value ? new Date(value as string).toLocaleDateString() : "";
          case "number":
            return typeof value === "number" ? value.toLocaleString() : "";
          default:
            return String(value ?? "");
        }
      },
      filterFn: col.type === "boolean" ? "equals" : "includesString",
    })),
    [columns]
  );

  // Transform rows for TanStack Table
  const tableData = useMemo<LocalTableRow[]>(() =>
    rows.map((row) => ({
      ...row.data,
      _rowId: row.id,
      _position: row.position,
    } as LocalTableRow)),
    [rows]
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return {
    // Table instance
    table,

    // Raw data
    columns,
    rows: tableData,
    rawRows: rows, // Expose raw rows for proper schema compliance

    // Store actions
    updateCellValue: store.updateCellValue,
    addRow: () => store.createRow(tableId),
    deleteRow: store.deleteRow,
    addColumn: (name: string, type?: Column["type"]) => store.createColumn(tableId, name, type),
    deleteColumn: store.deleteColumn,
    updateColumn: store.updateColumn,

    // Table state
    tableState: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  };
};

// === Sample Data Initialization ===
export const initializeSampleData = (): string => {
  const store = useCollectionStore.getState();

  // Check if we already have tables to avoid double initialization
  const existingTables = Array.from(tablesCollection.state.values());
  if (existingTables.length > 0) {
    // Return the first existing table instead of creating a new one
    const firstTable = existingTables[0];
    store.setSelectedTable(firstTable.id);
    return firstTable.id;
  }

  const tableId = store.createTable("Sample Table");

  const nameColumnId = store.createColumn(tableId, "Name", "text");
  const ageColumnId = store.createColumn(tableId, "Age", "number");
  const activeColumnId = store.createColumn(tableId, "Active", "boolean");

  const sampleData = [
    { [nameColumnId]: "Alice Johnson", [ageColumnId]: 28, [activeColumnId]: true },
    { [nameColumnId]: "Bob Smith", [ageColumnId]: 34, [activeColumnId]: false },
    { [nameColumnId]: "Carol Davis", [ageColumnId]: 25, [activeColumnId]: true },
  ];

  sampleData.forEach((data) => {
    store.createRow(tableId, data);
  });

  store.setSelectedTable(tableId);
  return tableId;
};

// === Utility Hooks ===
export const useSelectedTable = () => {
  const selectedTableId = useCollectionStore((state) => state.selectedTableId);
  const { data: tables } = useTables();

  return useMemo(() =>
    tables.find(table => table.id === selectedTableId) || null,
    [tables, selectedTableId]
  );
};

export const useTableStats = (tableId: string) => {
  const { data: columns } = useTableColumns(tableId);
  const { data: rows } = useTableRows(tableId);

  return useMemo(() => ({
    columnCount: columns.length,
    rowCount: rows.length,
    lastUpdated: Math.max(
      ...rows.map(row => row.createdAt.getTime()),
      0
    ),
  }), [columns.length, rows]);
};

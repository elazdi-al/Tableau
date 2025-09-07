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
import { useMemo, useState } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
    Column,
    ColumnSchema,
    RendererRegistry,
    Row,
    RowSchema,
    Table,
    TableSchema
} from "./types";

// Re-export types for convenience
export type { Column, Row, Table };

// === Constants ===
const DEFAULT_USER_ID = "local-user";
const DEFAULT_TABLE_ID = "local-table";
const DEFAULT_COLUMN_WIDTH = 200;
const DEFAULT_PAGE_SIZE = 10;

// === Utility Functions ===
export const createDefaultRendererRegistry = (): RendererRegistry => {
  return createRendererRegistryFromComponents();
};

const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
          id: DEFAULT_TABLE_ID,
          name,
          userId: DEFAULT_USER_ID,
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
          id: generateId('col'),
          tableId,
          name,
          type,
          width: DEFAULT_COLUMN_WIDTH,
          position: existingColumns.length,
          userId: DEFAULT_USER_ID,
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
          id: generateId('row'),
          tableId,
          position: existingRows.length,
          data,
          userId: DEFAULT_USER_ID,
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
      .where(({ table }) => eq(table.userId, DEFAULT_USER_ID))
      .orderBy(({ table }) => table.createdAt)
  );
};

export const useTable = (tableId: string | null) => {
  return useLiveQuery((q) =>
    q.from({ table: tablesCollection })
     .where(({ table }) => and(eq(table.id, tableId), eq(table.userId, DEFAULT_USER_ID)))
  );
};

export const useTableColumns = (tableId: string) => {
  return useLiveQuery((q) =>
    q.from({ column: columnsCollection })
     .where(({ column }) => and(eq(column.tableId, tableId), eq(column.userId, DEFAULT_USER_ID)))
     .orderBy(({ column }) => column.position)
  );
};

export const useTableRows = (tableId: string) => {
  return useLiveQuery((q) =>
    q.from({ row: rowsCollection })
     .where(({ row }) => and(eq(row.tableId, tableId), eq(row.userId, DEFAULT_USER_ID)))
     .orderBy(({ row }) => row.position)
  );
};

// === TanStack Table Integration ===
export interface UseLocalTableOptions {
  tableId?: string;
  initialPageSize?: number;
}

export const useLocalTable = ({ tableId, initialPageSize = DEFAULT_PAGE_SIZE }: UseLocalTableOptions) => {
  const store = useCollectionStore();

  // Get tables data at the top level for live query functionality
  const { data: tables } = useTables();

  // Initialize sample data if no tables exist
  useMemo(() => {
    if (tables.length === 0) {
      initializeSampleData(tables);
    }
  }, [tables]);

  // State for table controls
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  // Live queries for reactive data
  const { data: columns } = useTableColumns(tableId || DEFAULT_TABLE_ID);
  const { data: rows } = useTableRows(tableId || DEFAULT_TABLE_ID);

  // Simple column definitions for TanStack Table
  const tableColumns = useMemo<ColumnDef<Row>[]>(() =>
    columns.map((col): ColumnDef<Row> => ({
      id: col.id,
      accessorFn: (row) => row.data[col.id],
      header: col.name,
      size: col.width,
    })),
    [columns]
  );

  // Initialize TanStack Table with raw rows
  const table = useReactTable({
    data: rows,
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
    // Table instance and data
    table,
    columns,
    rows,
    isLoading: false,

    // Store actions
    updateCellValue: store.updateCellValue,
    addRow: (data?: Record<string, unknown>) => store.createRow(tableId || DEFAULT_TABLE_ID, data),
    deleteRow: store.deleteRow,
    addColumn: (name: string, type?: Column["type"]) => store.createColumn(tableId || DEFAULT_TABLE_ID, name, type),
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
export const initializeSampleData = (tables: Table[]): string => {
  const store = useCollectionStore.getState();

  // Check if we already have tables to avoid double initialization
  if (tables.length > 0) {
    // Use the first existing table from the live query
    const firstTable = tables[0];
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

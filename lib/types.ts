import { z } from "zod";

// === Schema Definitions ===
export const TableSchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string().default("local-user"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const ColumnSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "boolean", "date", "select"]).default("text"),
  width: z.number().default(200),
  position: z.number(),
  userId: z.string().default("local-user"),
});

export const RowSchema = z.object({
  id: z.string(),
  tableId: z.string(),
  position: z.number(),
  data: z.record(z.string(), z.unknown()).default({}),
  userId: z.string().default("local-user"),
  createdAt: z.date().default(() => new Date()),
});

// === Inferred Types ===
export type Table = z.infer<typeof TableSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Row = z.infer<typeof RowSchema>;

// === Table Configuration ===
export interface TableConfig {
  showRowNumbers?: boolean;
  enableSelection?: boolean;
  enableEditing?: boolean;
  density?: "compact" | "normal" | "comfortable";
  striped?: boolean;
}

// === Cell Renderer Types ===
export interface CellRendererProps<T = unknown> {
  value: T;
  onChange: (value: T) => void;
  column: Column;
  row: Row;
  editing: boolean;
  readonly?: boolean;
}

export interface CellRenderer<T = unknown> {
  component: React.ComponentType<CellRendererProps<T>>;
  validate: (value: unknown) => T;
  defaultValue: T;
  format?: (value: T) => string;
}

// === Renderer Registry Type ===
export type RendererRegistry = Map<string, CellRenderer<any>>;

// === Table Configuration Builder Types ===
export interface TableConfiguration {
  showRowNumbers?: boolean;
  showSelectAll?: boolean;
  enableSelection?: boolean;
  enableEditing?: boolean;
  showActionColumn?: boolean;
  density?: "compact" | "normal" | "comfortable";
  striped?: boolean;
  renderers?: RendererRegistry;
  availableColumnTypes?: string[];
  defaultColumnType?: string;
}

// === TanStack Table Integration Types ===
export interface LocalTableRow {
  [key: string]: unknown;
  _rowId: string;
  _position: number;
}

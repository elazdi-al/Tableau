import { z } from "zod";

// === Core ID Types with Branding ===
export const TableId = z.string().brand("TableId");
export const ColumnId = z.string().brand("ColumnId");
export const RowId = z.string().brand("RowId");
export const CellId = z.string().brand("CellId");

export type TableId = z.infer<typeof TableId>;
export type ColumnId = z.infer<typeof ColumnId>;
export type RowId = z.infer<typeof RowId>;
export type CellId = z.infer<typeof CellId>;

// === Column Type Registry ===
export type ColumnTypeAlignment = "left" | "center" | "right";
export type ColumnTypeCategory =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "custom";

export interface ColumnTypeDefinition<T = unknown> {
  readonly type: string;
  readonly category: ColumnTypeCategory;
  readonly label: string;
  readonly description?: string;
  readonly defaultValue: T;
  readonly alignment: ColumnTypeAlignment;
  readonly headerAlignment?: ColumnTypeAlignment;
  readonly validate: (value: unknown) => T;
  readonly format?: (value: T) => string;
  readonly configSchema?: z.ZodSchema<any>;
  readonly defaultConfig?: Record<string, unknown>;
  readonly icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ColumnTypeRegistry {
  readonly types: Map<string, ColumnTypeDefinition>;
  readonly categories: Map<ColumnTypeCategory, ColumnTypeDefinition[]>;
  readonly getType: (type: string) => ColumnTypeDefinition | undefined;
  readonly getTypesByCategory: (
    category: ColumnTypeCategory,
  ) => ColumnTypeDefinition[];
  readonly getAllTypes: () => ColumnTypeDefinition[];
  readonly registerType: <T>(definition: ColumnTypeDefinition<T>) => void;
}

// === Column Schema ===
export const ColumnSchema = z.object({
  id: ColumnId,
  tableId: TableId,
  type: z.string(),
  name: z.string().min(1),
  width: z.number().min(50).max(800).default(200),
  position: z.number().min(0),
  required: z.boolean().default(false),
  readonly: z.boolean().default(false),
  config: z.record(z.string(), z.unknown()).default({}),
  // Config-driven properties
  alignment: z.enum(["left", "center", "right"]).optional(),
  headerAlignment: z.enum(["left", "center", "right"]).optional(),
});

export type Column = z.infer<typeof ColumnSchema>;

// Legacy type aliases for backward compatibility
export type TextColumn = Column;
export type NumberColumn = Column;
export type SelectColumn = Column;
export type DateColumn = Column;
export type BooleanColumn = Column;
export type CustomColumn = Column;

// === Cell Renderer Props ===
export interface CellRendererProps<T> {
  value: T;
  onChange: (value: T) => void;
  column: Column;
  typeDefinition: ColumnTypeDefinition<T>;
  readonly: boolean;
  editing: boolean;
}

// === Column Renderer Definition ===
export interface ColumnRenderer<T = unknown> {
  type: string;
  component: React.ComponentType<CellRendererProps<T>>;
  validate: (value: unknown, column: Column) => T;
  defaultValue: T;
}

// === Entity Schemas ===
export const TableSchema = z.object({
  id: TableId,
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RowSchema = z.object({
  id: RowId,
  tableId: TableId,
  position: z.number().min(0),
  selected: z.boolean().default(false),
  createdAt: z.date(),
});

export const CellSchema = z.object({
  id: CellId,
  rowId: RowId,
  columnId: ColumnId,
  value: z.unknown(),
  updatedAt: z.date(),
});

export const TableOptionsSchema = z.object({
  showRowNumbers: z.boolean().default(true),
  showSelectAll: z.boolean().default(true),
  enableSelection: z.boolean().default(true),
  enableEditing: z.boolean().default(true),
  showActionColumn: z.boolean().default(true),
  columnSizing: z.enum(["fixed", "auto", "balanced"]).default("balanced"),
  minColumnWidth: z.number().min(50).default(80),
  maxColumnWidth: z.number().max(1000).default(400),
  density: z.enum(["compact", "normal", "comfortable"]).default("normal"),
  striped: z.boolean().default(false),
  // Config-driven options
  availableColumnTypes: z.array(z.string()).optional(),
  defaultColumnType: z.string().default("text"),
  headerAlignment: z.enum(["left", "center", "right"]).default("left"),
  cellAlignment: z.enum(["left", "center", "right"]).default("left"),
});

export const TableSelectionSchema = z.object({
  selectedRows: z.set(RowId),
  selectedColumns: z.set(ColumnId),
  selectedCells: z.set(CellId),
  isAllSelected: z.boolean().default(false),
});

// === Inferred Types ===
export type Table = z.infer<typeof TableSchema>;
export type Row = z.infer<typeof RowSchema>;
export type Cell = z.infer<typeof CellSchema>;
export type TableOptions = z.infer<typeof TableOptionsSchema>;
export type TableSelection = z.infer<typeof TableSelectionSchema>;
export type ColumnSizingMode = TableOptions["columnSizing"];

// === Config-Driven Table Configuration ===
export interface TableConfiguration {
  readonly options: TableOptions;
  readonly typeRegistry: ColumnTypeRegistry;
  readonly renderers: Map<string, ColumnRenderer>;
  readonly getAvailableTypes: () => ColumnTypeDefinition[];
  readonly getDefaultValue: (type: string) => unknown;
  readonly getAlignment: (type: string) => ColumnTypeAlignment;
  readonly getHeaderAlignment: (type: string) => ColumnTypeAlignment;
  readonly validateValue: (value: unknown, type: string) => unknown;
  readonly formatValue: (value: unknown, type: string) => string;
}

// === Master Config Interface ===
export interface TableConfigMaster {
  readonly build: () => TableConfiguration;
  readonly addColumnType: <T>(
    definition: ColumnTypeDefinition<T>,
  ) => TableConfigMaster;
  readonly setOptions: (options: Partial<TableOptions>) => TableConfigMaster;
  readonly getConfig: () => TableConfiguration;
}

// === Validation Functions ===
export const validateColumn = (data: unknown): Column =>
  ColumnSchema.parse(data);
export const validateTable = (data: unknown): Table => TableSchema.parse(data);
export const validateOptions = (data: unknown): TableOptions =>
  TableOptionsSchema.parse(data);

// === ID Creators ===
export const createTableId = (id: string): TableId => TableId.parse(id);
export const createColumnId = (id: string): ColumnId => ColumnId.parse(id);
export const createRowId = (id: string): RowId => RowId.parse(id);
export const createCellId = (id: string): CellId => CellId.parse(id);

// === Type Inference Helpers ===
export type InferColumnType<T extends ColumnTypeDefinition> =
  T extends ColumnTypeDefinition<infer U> ? U : never;
export type ColumnTypeMap = { [K in string]: ColumnTypeDefinition };

// === Config-Driven Utilities ===
export const createColumnTypeRegistry = (): ColumnTypeRegistry => {
  const types = new Map<string, ColumnTypeDefinition>();
  const categories = new Map<ColumnTypeCategory, ColumnTypeDefinition[]>();

  return {
    types,
    categories,
    getType: (type: string) => types.get(type),
    getTypesByCategory: (category: ColumnTypeCategory) =>
      categories.get(category) || [],
    getAllTypes: () => Array.from(types.values()),
    registerType: <T>(definition: ColumnTypeDefinition<T>) => {
      types.set(definition.type, definition);
      const categoryTypes = categories.get(definition.category) || [];
      categoryTypes.push(definition);
      categories.set(definition.category, categoryTypes);
    },
  };
};

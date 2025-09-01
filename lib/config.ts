import { z } from "zod";
import {
  Column,
  ColumnRenderer,
  TableOptions,
  ColumnTypeDefinition,
  ColumnTypeRegistry,
  ColumnTypeAlignment,
  ColumnTypeCategory,
  TableConfiguration,
  TableConfigMaster,
  validateOptions,
  validateColumn,
  createColumnTypeRegistry,
  TableId,
  ColumnId,
  createColumnId,
  CellRendererProps,
} from "./types";
import { TextT, Hash, ToggleLeft, Calendar, ListBullets } from "@phosphor-icons/react";

// === Built-in Column Type Definitions ===
export const createTextType = (): ColumnTypeDefinition<string> => ({
  type: "text",
  category: "text",
  label: "Text",
  description: "Single or multi-line text input",
  defaultValue: "",
  alignment: "left",
  headerAlignment: "left",
  validate: (value: unknown) => String(value || ""),
  format: (value: string) => value,
  icon: TextT,
  configSchema: z.object({
    placeholder: z.string().optional(),
    maxLength: z.number().optional(),
    multiline: z.boolean().default(false),
  }),
  defaultConfig: {
    placeholder: "Enter text...",
    multiline: false,
  },
});

export const createNumberType = (): ColumnTypeDefinition<number> => ({
  type: "number",
  category: "number",
  label: "Number",
  description: "Numeric input with formatting options",
  defaultValue: 0,
  alignment: "right",
  headerAlignment: "right",
  validate: (value: unknown) => {
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : num;
  },
  format: (value: number) => (value ?? 0).toLocaleString(),
  icon: Hash,
  configSchema: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().default(1),
    precision: z.number().optional(),
    format: z.enum(["decimal", "currency", "percentage"]).default("decimal"),
  }),
  defaultConfig: {
    step: 1,
    format: "decimal",
  },
});

export const createBooleanType = (): ColumnTypeDefinition<boolean> => ({
  type: "boolean",
  category: "boolean",
  label: "Boolean",
  description: "True/false checkbox or toggle",
  defaultValue: false,
  alignment: "center",
  headerAlignment: "center",
  validate: (value: unknown) => Boolean(value),
  format: (value: boolean) => (value ? "Yes" : "No"),
  icon: ToggleLeft,
  configSchema: z.object({
    trueLabel: z.string().default("Yes"),
    falseLabel: z.string().default("No"),
  }),
  defaultConfig: {
    trueLabel: "Yes",
    falseLabel: "No",
  },
});

export const createDateType = (): ColumnTypeDefinition<Date> => ({
  type: "date",
  category: "date",
  label: "Date",
  description: "Date and time picker",
  defaultValue: new Date(),
  alignment: "left",
  headerAlignment: "left",
  validate: (value: unknown) => {
    if (value instanceof Date) return value;
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? new Date() : date;
  },
  format: (value: Date) => value.toLocaleDateString(),
  icon: Calendar,
  configSchema: z.object({
    format: z.enum(["date", "datetime", "time"]).default("date"),
    min: z.string().optional(),
    max: z.string().optional(),
  }),
  defaultConfig: {
    format: "date",
  },
});

export const createSelectType = (): ColumnTypeDefinition<
  string | string[]
> => ({
  type: "select",
  category: "select",
  label: "Select",
  description: "Dropdown selection with options",
  defaultValue: "",
  alignment: "left",
  headerAlignment: "left",
  validate: (value: unknown) => String(value || ""),
  format: (value: string | string[]) =>
    Array.isArray(value) ? value.join(", ") : String(value),
  icon: ListBullets,
  configSchema: z.object({
    options: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
          color: z.string().optional(),
        }),
      )
      .min(1),
    multiple: z.boolean().default(false),
  }),
  defaultConfig: {
    options: [],
    multiple: false,
  },
});

// === Master Configuration Class ===
export class TableMasterConfig implements TableConfigMaster {
  private options: TableOptions;
  private typeRegistry: ColumnTypeRegistry;
  private renderers = new Map<string, ColumnRenderer>();

  constructor(options: Partial<TableOptions> = {}) {
    this.options = validateOptions({
      showRowNumbers: true,
      showSelectAll: true,
      enableSelection: true,
      enableEditing: true,
      showActionColumn: true,
      columnSizing: "balanced",
      minColumnWidth: 80,
      maxColumnWidth: 400,
      density: "normal",
      striped: false,
      headerAlignment: "left",
      cellAlignment: "left",
      defaultColumnType: "text",
      ...options,
    });

    this.typeRegistry = createColumnTypeRegistry();

    // Register built-in types
    this.registerBuiltInTypes();
  }

  private registerBuiltInTypes(): void {
    this.typeRegistry.registerType(createTextType());
    this.typeRegistry.registerType(createNumberType());
    this.typeRegistry.registerType(createBooleanType());
    this.typeRegistry.registerType(createDateType());
    this.typeRegistry.registerType(createSelectType());
  }

  // === Configuration Methods ===
  setOptions(options: Partial<TableOptions>): TableMasterConfig {
    this.options = validateOptions({ ...this.options, ...options });
    return this;
  }

  addColumnType<T>(definition: ColumnTypeDefinition<T>): TableMasterConfig {
    this.typeRegistry.registerType(definition);
    return this;
  }

  addRenderer<T>(renderer: ColumnRenderer<T>): TableMasterConfig {
    this.renderers.set(renderer.type, renderer);
    return this;
  }

  // === Fluent Configuration API ===
  density(density: "compact" | "normal" | "comfortable"): TableMasterConfig {
    return this.setOptions({ density });
  }

  columnSizing(mode: "fixed" | "auto" | "balanced"): TableMasterConfig {
    return this.setOptions({ columnSizing: mode });
  }

  selection(enabled: boolean): TableMasterConfig {
    return this.setOptions({
      enableSelection: enabled,
      showSelectAll: enabled,
    });
  }

  editing(enabled: boolean): TableMasterConfig {
    return this.setOptions({ enableEditing: enabled });
  }

  striped(enabled: boolean): TableMasterConfig {
    return this.setOptions({ striped: enabled });
  }

  actionColumn(enabled: boolean): TableMasterConfig {
    return this.setOptions({ showActionColumn: enabled });
  }

  alignment(
    cell: ColumnTypeAlignment,
    header?: ColumnTypeAlignment,
  ): TableMasterConfig {
    return this.setOptions({
      cellAlignment: cell,
      headerAlignment: header || cell,
    });
  }

  availableTypes(...types: string[]): TableMasterConfig {
    return this.setOptions({ availableColumnTypes: types });
  }

  defaultType(type: string): TableMasterConfig {
    return this.setOptions({ defaultColumnType: type });
  }

  // === Build Configuration ===
  build(): TableConfiguration {
    return {
      options: this.options,
      typeRegistry: this.typeRegistry,
      renderers: this.renderers,

      getAvailableTypes: () => {
        const available = this.options.availableColumnTypes;
        if (available && available.length > 0) {
          return available
            .map((type) => this.typeRegistry.getType(type))
            .filter((def): def is ColumnTypeDefinition => def !== undefined);
        }
        return this.typeRegistry.getAllTypes();
      },

      getDefaultValue: (type: string) => {
        const typeDef = this.typeRegistry.getType(type);
        return typeDef?.defaultValue ?? null;
      },

      getAlignment: (type: string) => {
        const typeDef = this.typeRegistry.getType(type);
        return typeDef?.alignment ?? this.options.cellAlignment;
      },

      getHeaderAlignment: (type: string) => {
        const typeDef = this.typeRegistry.getType(type);
        return typeDef?.headerAlignment ?? this.options.headerAlignment;
      },

      validateValue: (value: unknown, type: string) => {
        const typeDef = this.typeRegistry.getType(type);
        return typeDef?.validate(value) ?? value;
      },

      formatValue: (value: unknown, type: string) => {
        const typeDef = this.typeRegistry.getType(type);
        return typeDef?.format?.(value as any) ?? String(value);
      },
    };
  }

  getConfig(): TableConfiguration {
    return this.build();
  }

  // === Column Creation Helpers ===
  createColumn(
    tableId: TableId,
    type: string,
    name: string,
    position: number,
    overrides: Partial<Column> = {},
  ): Column {
    const typeDef = this.typeRegistry.getType(type);
    const id = createColumnId(`${tableId}-${type}-${position}-${Date.now()}`);

    return validateColumn({
      id,
      tableId,
      type,
      name,
      position,
      width: 200,
      required: false,
      readonly: false,
      config: typeDef?.defaultConfig || {},
      alignment: typeDef?.alignment,
      headerAlignment: typeDef?.headerAlignment,
      ...overrides,
    });
  }

  // === Type-Safe Column Builders ===
  buildColumns(
    tableId: TableId,
    specs: Array<{
      type: string;
      name: string;
      config?: Record<string, unknown>;
      width?: number;
      required?: boolean;
      readonly?: boolean;
    }>,
  ): Column[] {
    return specs.map((spec, index) =>
      this.createColumn(tableId, spec.type, spec.name, index, {
        config: {
          ...this.typeRegistry.getType(spec.type)?.defaultConfig,
          ...spec.config,
        },
        width: spec.width,
        required: spec.required,
        readonly: spec.readonly,
      }),
    );
  }
}

// === Factory Functions ===
export const createTableConfig = (
  options?: Partial<TableOptions>,
): TableMasterConfig => new TableMasterConfig(options);

// Backward compatibility
export const table = createTableConfig;

// === Configuration Presets ===
export const presets = {
  minimal: () =>
    createTableConfig({
      showRowNumbers: false,
      showSelectAll: false,
      enableSelection: false,
      showActionColumn: false,
      density: "compact",
      striped: false,
    }),

  spreadsheet: () =>
    createTableConfig({
      showRowNumbers: true,
      showSelectAll: true,
      enableSelection: true,
      showActionColumn: true,
      density: "compact",
      columnSizing: "auto",
      striped: true,
    }),

  readonly: () =>
    createTableConfig({
      enableEditing: false,
      enableSelection: false,
      showSelectAll: false,
      showActionColumn: false,
      density: "comfortable",
      striped: true,
    }),

  dashboard: () =>
    createTableConfig({
      showRowNumbers: false,
      showSelectAll: false,
      enableSelection: false,
      showActionColumn: false,
      density: "comfortable",
      striped: true,
      headerAlignment: "center",
      cellAlignment: "center",
    }),
};

// === Type-Safe Helpers ===
export const defineColumnType = <T>(
  definition: ColumnTypeDefinition<T>,
): ColumnTypeDefinition<T> => definition;

export const defineRenderer = <T>(
  type: string,
  component: React.ComponentType<CellRendererProps<T>>,
  validate: (value: unknown) => T,
  defaultValue: T,
): ColumnRenderer<T> => ({
  type,
  component,
  validate: (value, _column) => validate(value),
  defaultValue,
});

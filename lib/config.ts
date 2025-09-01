import { 
  Column, ColumnRenderer, TableOptions, validateOptions, validateColumn,
  TextColumn, NumberColumn, SelectColumn, DateColumn, BooleanColumn, CustomColumn,
  TableId, ColumnId, createColumnId
} from './types'

// === Column Builder Class ===
export class ColumnBuilder<T extends Column = Column> {
  constructor(
    private readonly type: string,
    private readonly config: Record<string, unknown> = {}
  ) {}

  width(width: number): ColumnBuilder<T> {
    return new ColumnBuilder(this.type, { ...this.config, width })
  }

  required(required = true): ColumnBuilder<T> {
    return new ColumnBuilder(this.type, { ...this.config, required })
  }

  readonly(readonly = true): ColumnBuilder<T> {
    return new ColumnBuilder(this.type, { ...this.config, readonly })
  }

  build(id: ColumnId, tableId: TableId, position: number): T {
    const { name, width = 200, required = false, readonly = false, ...rest } = this.config
    
    return validateColumn({
      id,
      tableId,
      name,
      type: this.type,
      width,
      position,
      required,
      readonly,
      ...(this.type !== 'text' && this.type !== 'number' && this.type !== 'date' && this.type !== 'boolean' ? 
          { config: rest } : 
          { config: rest })
    }) as T
  }
}

// === Specialized Column Builders ===
export class TextColumnBuilder extends ColumnBuilder<TextColumn> {
  placeholder(placeholder: string): TextColumnBuilder {
    return new TextColumnBuilder('text', { ...this.config, placeholder })
  }

  maxLength(maxLength: number): TextColumnBuilder {
    return new TextColumnBuilder('text', { ...this.config, maxLength })
  }

  multiline(multiline = true): TextColumnBuilder {
    return new TextColumnBuilder('text', { ...this.config, multiline })
  }
}

export class NumberColumnBuilder extends ColumnBuilder<NumberColumn> {
  min(min: number): NumberColumnBuilder {
    return new NumberColumnBuilder('number', { ...this.config, min })
  }

  max(max: number): NumberColumnBuilder {
    return new NumberColumnBuilder('number', { ...this.config, max })
  }

  step(step: number): NumberColumnBuilder {
    return new NumberColumnBuilder('number', { ...this.config, step })
  }

  precision(precision: number): NumberColumnBuilder {
    return new NumberColumnBuilder('number', { ...this.config, precision })
  }

  format(format: 'decimal' | 'currency' | 'percentage'): NumberColumnBuilder {
    return new NumberColumnBuilder('number', { ...this.config, format })
  }
}

export class SelectColumnBuilder extends ColumnBuilder<SelectColumn> {
  options(options: Array<{ value: string; label: string; color?: string }>): SelectColumnBuilder {
    return new SelectColumnBuilder('select', { ...this.config, options })
  }

  multiple(multiple = true): SelectColumnBuilder {
    return new SelectColumnBuilder('select', { ...this.config, multiple })
  }
}

// === Table Configuration Builder ===
export class TableConfig {
  private options: TableOptions
  private renderers = new Map<string, ColumnRenderer>()
  private columnBuilders: ColumnBuilder[] = []

  constructor(options: Partial<TableOptions> = {}) {
    this.options = validateOptions({
      showRowNumbers: true,
      showSelectAll: true,
      enableSelection: true,
      enableEditing: true,
      columnSizing: 'balanced',
      minColumnWidth: 80,
      maxColumnWidth: 400,
      density: 'normal',
      striped: false,
      ...options
    })
  }

  // === Fluent Configuration API ===
  density(density: 'compact' | 'normal' | 'comfortable'): TableConfig {
    this.options = { ...this.options, density }
    return this
  }

  columnSizing(mode: 'fixed' | 'auto' | 'balanced'): TableConfig {
    this.options = { ...this.options, columnSizing: mode }
    return this
  }

  selection(enabled: boolean): TableConfig {
    this.options = { 
      ...this.options, 
      enableSelection: enabled,
      showSelectAll: enabled,
      showRowNumbers: enabled
    }
    return this
  }

  editing(enabled: boolean): TableConfig {
    this.options = { ...this.options, enableEditing: enabled }
    return this
  }

  striped(enabled: boolean): TableConfig {
    this.options = { ...this.options, striped: enabled }
    return this
  }

  // === Renderer Registration ===
  addRenderer<T = unknown>(renderer: ColumnRenderer<T>): TableConfig {
    this.renderers.set(renderer.type, renderer)
    return this
  }

  customColumn<T = unknown>(
    type: string,
    component: React.ComponentType<import('./types').CellRendererProps<T>>,
    validate: (value: unknown, column: Column) => T,
    defaultValue: T
  ): TableConfig {
    return this.addRenderer({ type, component, validate, defaultValue })
  }

  // === Strongly-Typed Column Builders ===
  text(name: string): TextColumnBuilder {
    const builder = new TextColumnBuilder('text', { name })
    this.columnBuilders.push(builder)
    return builder
  }

  number(name: string): NumberColumnBuilder {
    const builder = new NumberColumnBuilder('number', { name })
    this.columnBuilders.push(builder)
    return builder
  }

  select(name: string): SelectColumnBuilder {
    const builder = new SelectColumnBuilder('select', { name })
    this.columnBuilders.push(builder)
    return builder
  }

  date(name: string): ColumnBuilder<DateColumn> {
    const builder = new ColumnBuilder<DateColumn>('date', { name })
    this.columnBuilders.push(builder)
    return builder
  }

  boolean(name: string): ColumnBuilder<BooleanColumn> {
    const builder = new ColumnBuilder<BooleanColumn>('boolean', { name })
    this.columnBuilders.push(builder)
    return builder
  }

  custom<T extends Column = CustomColumn>(type: string, name: string): ColumnBuilder<T> {
    const builder = new ColumnBuilder<T>(type, { name })
    this.columnBuilders.push(builder)
    return builder
  }

  // === Build Methods ===
  buildColumns(tableId: TableId): Column[] {
    return this.columnBuilders.map((builder, index) => 
      builder.build(createColumnId(`${tableId}-col-${index}`), tableId, index)
    )
  }

  build() {
    return {
      options: this.options,
      renderers: this.renderers,
      columnBuilders: this.columnBuilders
    }
  }

  // === Complete Table Schema ===
  schema() {
    return {
      options: this.options,
      renderers: this.renderers,
      buildTable: (tableId: TableId) => ({
        options: this.options,
        renderers: this.renderers,
        columns: this.buildColumns(tableId)
      })
    }
  }
}

// === Factory Functions ===
export const table = (options?: Partial<TableOptions>) => new TableConfig(options)

// === Configuration Presets ===
export const presets = {
  minimal: () => table({
    showRowNumbers: false,
    showSelectAll: false,
    enableSelection: false,
    density: 'compact',
    striped: false
  }),

  spreadsheet: () => table({
    showRowNumbers: true,
    showSelectAll: true,
    enableSelection: true,
    density: 'compact',
    columnSizing: 'auto',
    striped: true
  }),

  readonly: () => table({
    enableEditing: false,
    enableSelection: false,
    showSelectAll: false,
    density: 'comfortable',
    striped: true
  })
}
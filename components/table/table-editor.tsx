"use client";

import { useEffect, useState, useRef } from "react";
import { useDatabase, initializeSampleData } from "@/lib/db";
import { TableId, TableConfiguration, RowId } from "@/lib/types";
import { calculateColumnWidths } from "@/lib/column-sizing";
import { TableHeader } from "./table-header";
import { TableRow } from "./table-row";
import { TableActions } from "./table-actions";

interface TableEditorProps {
  readonly tableId?: TableId;
  readonly config?: TableConfiguration;
  readonly className?: string;
  // Legacy support - deprecated, use config instead
  readonly renderers?: Map<
    string,
    import("@/lib/types").ColumnRenderer<unknown>
  >;
  readonly showActionColumn?: boolean;
}

export function TableEditor({
  tableId,
  config,
  className = "",
  renderers: legacyRenderers,
  showActionColumn,
}: TableEditorProps) {
  const {
    getTableColumns,
    getTableRows,
    getCell,
    options,
    setOptions,
    addColumn,
    duplicateRow,
    deleteRow,
  } = useDatabase();
  const [currentTableId, setCurrentTableId] = useState<TableId | null>(
    tableId || null,
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Use config or create a minimal fallback
  const activeConfig = config || {
    options: {
      showRowNumbers: true,
      showSelectAll: true,
      enableSelection: true,
      enableEditing: true,
      showActionColumn: showActionColumn ?? true,
      columnSizing: "balanced" as const,
      minColumnWidth: 80,
      maxColumnWidth: 400,
      density: "normal" as const,
      striped: false,
      availableColumnTypes: ["text", "number"],
      defaultColumnType: "text",
      headerAlignment: "left" as const,
      cellAlignment: "left" as const,
    },
    typeRegistry: {
      types: new Map(),
      categories: new Map(),
      getType: () => undefined,
      getTypesByCategory: () => [],
      getAllTypes: () => [],
      registerType: () => {},
    },
    renderers: legacyRenderers || new Map(),
    getAvailableTypes: () => [
      {
        type: "text",
        category: "text" as const,
        label: "Text",
        defaultValue: "",
        alignment: "left" as const,
        validate: (v: unknown) => String(v || ""),
      },
      {
        type: "number",
        category: "number" as const,
        label: "Number",
        defaultValue: 0,
        alignment: "right" as const,
        validate: (v: unknown) => Number(v) || 0,
      },
    ],
    getDefaultValue: (type: string) => (type === "number" ? 0 : ""),
    getAlignment: () => "left" as const,
    getHeaderAlignment: () => "left" as const,
    validateValue: (value: unknown) => value,
    formatValue: (value: unknown) => String(value),
  };

  // Action handlers
  const handleAddColumn = (type: string, name: string, columnConfig?: Record<string, unknown>) => {
    if (!currentTableId) return;

    const columns = getTableColumns(currentTableId);
    const maxPosition =
      columns.length > 0 ? Math.max(...columns.map((c) => c.position)) : -1;

    const typeDef = activeConfig.typeRegistry?.getType(type);

    addColumn({
      tableId: currentTableId,
      name: name,
      type: type,
      width: 200,
      position: maxPosition + 1,
      required: false,
      readonly: false,
      config: { ...typeDef?.defaultConfig, ...columnConfig },
      alignment: activeConfig.getAlignment(type),
      headerAlignment: activeConfig.getHeaderAlignment(type),
    });
  };

  const handleRowAction = (action: string, rowId: RowId) => {
    switch (action) {
      case "duplicate":
        duplicateRow(rowId);
        break;
      case "delete":
        deleteRow(rowId);
        break;
    }
  };

  // Apply config options to global state
  useEffect(() => {
    if (activeConfig?.options) {
      setOptions(activeConfig.options);
    }
  }, [activeConfig, setOptions]);

  // Use the provided tableId or initialize sample data
  useEffect(() => {
    if (!currentTableId) {
      // Always initialize sample data if no tableId is provided
      const sampleTableId = initializeSampleData();
      setCurrentTableId(sampleTableId);
    }
  }, [currentTableId]);

  const columns = currentTableId ? getTableColumns(currentTableId) : [];
  const rows = currentTableId ? getTableRows(currentTableId) : [];
  const tableOptions = activeConfig.options;

  // Calculate column widths based on content and sizing mode
  useEffect(() => {
    if (!currentTableId || columns.length === 0 || !containerRef.current)
      return;

    const containerWidth = containerRef.current.offsetWidth;

    const columnsData = columns.map((column) => ({
      column,
      cellValues: rows.map((row) => getCell(row.id, column.id)?.value),
    }));

    const calculatedWidths = calculateColumnWidths(columnsData, {
      mode: tableOptions.columnSizing,
      containerWidth,
      minColumnWidth: tableOptions.minColumnWidth,
      maxColumnWidth: tableOptions.maxColumnWidth,
      showRowNumbers: tableOptions.showRowNumbers,
      showActionColumn: tableOptions.showActionColumn,
    });

    // Only update if widths actually changed
    setColumnWidths((prevWidths) => {
      const hasChanged =
        Object.keys(calculatedWidths).some(
          (key) => prevWidths[key] !== calculatedWidths[key],
        ) ||
        Object.keys(prevWidths).length !== Object.keys(calculatedWidths).length;

      return hasChanged ? calculatedWidths : prevWidths;
    });
  }, [
    currentTableId,
    columns,
    rows,
    tableOptions.columnSizing,
    tableOptions.minColumnWidth,
    tableOptions.maxColumnWidth,
    tableOptions.showRowNumbers,
    getCell,
  ]);

  if (!currentTableId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="animate-pulse">Initializing table...</div>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div>No columns found</div>
      </div>
    );
  }

  // Merge calculated widths with column data
  const columnsWithWidths = columns.map((column) => ({
    ...column,
    width: columnWidths[column.id] || column.width,
  }));

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {/* Action Bubbles - Top Right */}
      <div className="flex justify-end mb-4">
        <TableActions tableId={currentTableId} />
      </div>
      
      <div className="border border-border rounded-lg shadow-sm relative overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-fit relative">
            <TableHeader
              columns={columnsWithWidths}
              showRowNumbers={tableOptions.showRowNumbers}
              showSelectAll={tableOptions.showSelectAll}
              showActionColumn={tableOptions.showActionColumn}
              onAddColumn={handleAddColumn}
              config={activeConfig}
            />
            <div className="bg-background">
              {rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  row={row}
                  columns={columnsWithWidths}
                  index={index}
                  showRowNumbers={tableOptions.showRowNumbers}
                  showActionColumn={tableOptions.showActionColumn}
                  customRenderers={activeConfig.renderers}
                  onRowAction={handleRowAction}
                  config={activeConfig}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Overlay for dropdowns to escape the overflow */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-20" />
      </div>
    </div>
  );
}

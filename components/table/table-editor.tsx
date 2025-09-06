"use client";

import { useState, useRef } from "react";
import { useLocalTable, useCollectionStore, createDefaultRendererRegistry, type Column } from "@/lib/local-table";
import { RendererRegistry } from "@/lib/types";
import { TableHeader } from "./table-header";
import { TableRow } from "./table-row";
import { TableActions } from "./table-actions";

interface TableEditorProps {
  readonly tableId?: string;
  readonly className?: string;
  readonly renderers?: RendererRegistry;
  readonly showActionColumn?: boolean;
}

export function TableEditor({
  tableId,
  className = "",
  renderers,
  showActionColumn = true,
}: TableEditorProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Use provided renderers or create default ones
  const activeRenderers = renderers || createDefaultRendererRegistry();

  // Use TanStack table integration with useLocalTable hook
  // Always call the hook (Rules of Hooks) - uses constant tableId from local-table.ts
  const localTable = useLocalTable({
    initialPageSize: 50,
  });

  // Get data from the local table hook
  const rows = localTable.table.getRowModel().rows || [];
  const columns = localTable.columns || [];
  const rawRows = localTable.rawRows || []; // Get raw rows for proper schema compliance

  // Selection handlers
  const handleRowSelect = (rowId: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === rows.length && rows.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map(row => row.original._rowId)));
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  // Row action handlers using localTable actions
  const handleRowAction = (action: string, rowId: string) => {
    switch (action) {
      case "duplicate":
        const originalRow = rows.find(row => row.original._rowId === rowId);
        if (originalRow) {
          const { _rowId, _position, ...data } = originalRow.original;
          localTable.addRow(data);
        }
        break;
      case "delete":
        localTable.deleteRow(rowId);
        setSelectedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(rowId);
          return newSet;
        });
        break;
    }
  };

  // Loading states - no longer needed since we use constant tableId

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div>No columns found</div>
      </div>
    );
  }

  // Selection state calculations
  const isAllSelected = selectedRows.size === rows.length && rows.length > 0;
  const hasPartialSelection = selectedRows.size > 0 && selectedRows.size < rows.length;

  // Merge calculated widths with column data
  const columnsWithWidths = columns.map((column) => ({
    ...column,
    width: columnWidths[column.id] || column.width || 200,
  }));

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {/* Action Bubbles - Top Right */}
      <div className="flex justify-end mb-4">
        <TableActions
          tableId="local-table"
          selectedRows={selectedRows}
          onClearSelection={handleClearSelection}
        />
      </div>

      <div className="border border-border rounded-lg shadow-sm relative overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-fit relative">
            {/* Table Header */}
            <TableHeader
              columns={columnsWithWidths}
              showRowNumbers={true}
              showSelectAll={true}
              showActionColumn={showActionColumn}
              tableId="local-table"
              isAllSelected={isAllSelected}
              hasPartialSelection={hasPartialSelection}
              onToggleSelectAll={handleSelectAll}
            />

            {/* Table Body */}
            <div className="bg-background">
              {rows.map((row, index) => {
                // Find the corresponding raw row to get proper schema-compliant data
                const rawRow = rawRows.find(r => r.id === row.original._rowId);

                if (!rawRow) {
                  return null; // Skip if raw row not found
                }

                return (
                  <TableRow
                    key={rawRow.id}
                    row={rawRow}
                    columns={columnsWithWidths}
                    index={index}
                    showRowNumbers={true}
                    showActionColumn={showActionColumn}
                    onRowAction={handleRowAction}
                    renderers={activeRenderers}
                    enableSelection={true}
                    isSelected={selectedRows.has(rawRow.id)}
                    onToggleSelection={(rowId) => handleRowSelect(rowId, !selectedRows.has(rowId))}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay for dropdowns to escape the overflow */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-20" />
      </div>
    </div>
  );
}

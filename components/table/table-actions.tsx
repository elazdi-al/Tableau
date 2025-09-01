"use client";

import { useDatabase } from "@/lib/db";
import { TableId } from "@/lib/types";
import { Plus, Trash } from "@phosphor-icons/react";

interface TableActionsProps {
  readonly tableId: TableId | null;
  readonly className?: string;
}

export function TableActions({ tableId, className = "" }: TableActionsProps) {
  const { selection, addRow, deleteRow, getTableRows } = useDatabase();

  const selectedRowsCount = selection.selectedRows.size;
  const hasSelectedRows = selectedRowsCount > 0;

  const handleAddRow = () => {
    if (!tableId) return;
    
    const rows = getTableRows(tableId);
    const maxPosition = rows.length > 0 ? 
      Math.max(...rows.map(row => row.position || 0)) : -1;

    addRow({
      tableId,
      position: maxPosition + 1,
    });
  };

  const handleDeleteSelected = () => {
    if (!hasSelectedRows) return;
    
    // Delete all selected rows
    selection.selectedRows.forEach(rowId => {
      deleteRow(rowId);
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Add Row Button - Always visible */}
      <button
        onClick={handleAddRow}
        disabled={!tableId}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-foreground/80 bg-background/80 backdrop-blur-sm border border-border/40 rounded-md hover:bg-muted/30 hover:text-foreground hover:border-border/60 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={12} weight="bold" />
        <span>Add Row</span>
      </button>

      {/* Delete Selected Button - Only visible when rows are selected */}
      {hasSelectedRows && (
        <button
          onClick={handleDeleteSelected}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-destructive bg-background/80 backdrop-blur-sm border border-destructive/20 rounded-md hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all duration-200 shadow-sm animate-in slide-in-from-right-2 fade-in-0 duration-300"
        >
          <Trash size={12} weight="bold" />
          <span>Delete {selectedRowsCount}</span>
        </button>
      )}
    </div>
  );
}
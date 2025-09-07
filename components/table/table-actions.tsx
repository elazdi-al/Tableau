"use client";

import { useCollectionStore } from "@/lib/local-table";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";

interface TableActionsProps {
  readonly tableId: string | null;
  readonly className?: string;
  readonly selectedRows?: Set<string>;
  readonly onClearSelection?: () => void;
}

export function TableActions({ tableId, className = "", selectedRows = new Set(), onClearSelection }: TableActionsProps) {
  const store = useCollectionStore();

  const selectedRowsCount = selectedRows.size;
  const hasSelectedRows = selectedRowsCount > 0;

  const handleAddRow = () => {
    if (!tableId) return;

    store.createRow(tableId);
  };

  const handleDeleteSelected = () => {
    if (!hasSelectedRows) return;

    // Delete all selected rows
    selectedRows.forEach(rowId => {
      store.deleteRow(rowId);
    });

    // Clear selection after deletion
    onClearSelection?.();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Add Row Button - Always visible */}
      <button
        onClick={handleAddRow}
        disabled={!tableId}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-foreground/80 bg-background/80 backdrop-blur-sm border border-border/40 rounded-md hover:bg-muted/30 hover:text-foreground hover:border-border/60 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon size={12} weight="bold" />
        <span>Add Row</span>
      </button>

      {/* Delete Selected Button - Only visible when rows are selected */}
      {hasSelectedRows && (
        <button
          onClick={handleDeleteSelected}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-destructive bg-background/80 backdrop-blur-sm border border-destructive/20 rounded-md hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm animate-in slide-in-from-right-2 fade-in-0 duration-300"
        >
          <TrashIcon size={12} weight="bold" />
          <span>Delete {selectedRowsCount}</span>
        </button>
      )}
    </div>
  );
}

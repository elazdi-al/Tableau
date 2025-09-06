"use client";

import { useEffect, useState } from "react";
import { useCollectionStore, useTableColumns, useTableRows, initializeSampleData, createDefaultRendererRegistry, type Column } from "@/lib/local-table";
import { RendererRegistry } from "@/lib/types";
import { TableRow } from "./table-row";
import { TableActions } from "./table-actions";
import { AddColumnDialog } from "./add-column-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

interface TableEditorProps {
  readonly tableId?: string;
  readonly className?: string;
  readonly renderers?: RendererRegistry;
}

export function TableEditor({
  tableId,
  className = "",
  renderers,
}: TableEditorProps) {
  const store = useCollectionStore();
  const [currentTableId, setCurrentTableId] = useState<string | null>(tableId || null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showAddColumnDialog, setShowAddColumnDialog] = useState(false);

  // Use provided renderers or create default ones
  const activeRenderers = renderers || createDefaultRendererRegistry();

  const { data: columns = [] } = useTableColumns(currentTableId || "");
  const { data: rows = [] } = useTableRows(currentTableId || "");

  // Initialize sample data if no tableId provided
  useEffect(() => {
    if (!currentTableId && !tableId) {
      const sampleTableId = initializeSampleData();
      setCurrentTableId(sampleTableId);
      store.setSelectedTable(sampleTableId);
    } else if (tableId) {
      setCurrentTableId(tableId);
      store.setSelectedTable(tableId);
    }
  }, [currentTableId, tableId, store]);

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
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map(row => row.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleRowAction = (action: string, rowId: string) => {
    switch (action) {
      case "duplicate":
        const originalRow = rows.find(row => row.id === rowId);
        if (originalRow) {
          store.createRow(currentTableId!, originalRow.data);
        }
        break;
      case "delete":
        store.deleteRow(rowId);
        setSelectedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(rowId);
          return newSet;
        });
        break;
    }
  };

  if (!currentTableId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="animate-pulse">Initializing table...</div>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">No columns yet</h3>
          <Button
            onClick={() => setShowAddColumnDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon size={16} />
            Add Column
          </Button>
        </div>

        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
          <p>Add your first column to get started</p>
        </div>

        <AddColumnDialog
          isOpen={showAddColumnDialog}
          onClose={() => setShowAddColumnDialog(false)}
          tableId={currentTableId}
        />
      </div>
    );
  }

  const isAllSelected = selectedRows.size === rows.length && rows.length > 0;
  const isPartiallySelected = selectedRows.size > 0 && selectedRows.size < rows.length;

  return (
    <div className={`w-full ${className}`}>
      {/* Action Bubbles - Top Right */}
      <div className="flex justify-end mb-4">
        <TableActions
          tableId={currentTableId}
          selectedRows={selectedRows}
          onClearSelection={handleClearSelection}
        />
      </div>

      <div className="border border-border rounded-lg shadow-sm relative overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-fit relative">
            {/* Table Header */}
            <div className="flex bg-muted/30 border-b border-border">
              {/* Select All Checkbox */}
              <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center border-r border-border">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => {
                    if (input) input.indeterminate = isPartiallySelected;
                  }}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </div>

              {/* Row Number Header */}
              <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center border-r border-border">
                <span className="text-xs font-medium text-muted-foreground">#</span>
              </div>

              {/* Column Headers */}
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className={`flex-1 min-w-[120px] h-10 flex items-center px-3 ${index < columns.length - 1 ? 'border-r border-border' : ''}`}
                  style={{ minWidth: Math.max(column.width || 120, 120) }}
                >
                  <span className="text-sm font-medium text-foreground truncate">
                    {column.name}
                  </span>
                </div>
              ))}

              {/* Add Column Button */}
              <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center border-l border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddColumnDialog(true)}
                  className="h-8 w-8 p-0"
                >
                  <PlusIcon size={14} />
                </Button>
              </div>

              {/* Actions Header */}
              <div className="flex-shrink-0 w-12 h-10 border-l border-border" />
            </div>

            {/* Table Body */}
            <div className="bg-background">
              {rows.map((row, index) => (
                <div key={row.id} className="flex border-b border-border last:border-b-0">
                  {/* Row Selection */}
                  <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center border-r border-border">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                      className="rounded border-border"
                    />
                  </div>

                  {/* Row Number */}
                  <div className="flex-shrink-0 w-12 h-10 flex items-center justify-center border-r border-border">
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>

                  <TableRow
                    row={row}
                    columns={columns}
                    index={index}
                    showRowNumbers={false} // We handle this above
                    showActionColumn={true}
                    onRowAction={handleRowAction}
                    renderers={activeRenderers}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddColumnDialog
        isOpen={showAddColumnDialog}
        onClose={() => setShowAddColumnDialog(false)}
        tableId={currentTableId}
      />
    </div>
  );
}

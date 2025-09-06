"use client";

import { useState } from "react";
import { Column } from "@/lib/local-table";
import { TableSelectAll } from "./table-select-all";
import { AddColumnDialog } from "./add-column-dialog";
import { PlusIcon } from "@phosphor-icons/react";

interface TableHeaderProps {
  readonly columns: Column[];
  readonly showRowNumbers?: boolean;
  readonly showSelectAll?: boolean;
  readonly showActionColumn?: boolean;
  readonly tableId: string;
  readonly isAllSelected?: boolean;
  readonly hasPartialSelection?: boolean;
  readonly onToggleSelectAll?: () => void;
}

export function TableHeader({
  columns,
  showRowNumbers = true,
  showSelectAll = true,
  showActionColumn = true,
  tableId,
  isAllSelected = false,
  hasPartialSelection = false,
  onToggleSelectAll,
}: TableHeaderProps) {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <div className="flex border-b border-border bg-muted rounded-t-lg">
        {/* Sticky row numbers/select all */}
        {showRowNumbers && (
          <div className="sticky left-0 z-10 flex-shrink-0 bg-muted rounded-tl-lg">
            {showSelectAll ? (
              <TableSelectAll
                isAllSelected={isAllSelected}
                hasPartialSelection={hasPartialSelection}
                onToggleSelectAll={onToggleSelectAll}
              />
            ) : (
              <div className="h-10 w-12 border-r border-border bg-muted" />
            )}
          </div>
        )}

        {/* Scrollable columns */}
        <div className="flex flex-1 min-w-0">
          {columns.map((column, index) => {
            const isLastColumn = index === columns.length - 1;
            return (
              <div
                key={column.id}
                className={`h-10 flex items-center px-3 font-medium text-sm bg-muted/30 hover:bg-muted/40 transition-colors flex-1 min-w-[120px] ${
                  !isLastColumn ? 'border-r border-border' : ''
                }`}
                style={{ minWidth: Math.max(column.width || 120, 120) }}
              >
                <div className="flex items-center gap-2 truncate w-full justify-start">
                  <span className="truncate font-medium">
                    {column.name}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-sm bg-muted-foreground/10 text-muted-foreground/70 border border-muted-foreground/20">
                    {column.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky add column button */}
        {showActionColumn && (
          <div className="sticky right-0 z-10 flex-shrink-0 bg-muted rounded-tr-lg">
            <button
              onClick={() => setShowDialog(true)}
              className="h-10 w-12 border-l border-border flex items-center justify-center bg-muted hover:bg-primary/10 hover:border-primary/20 transition-all cursor-pointer group"
            >
              <PlusIcon
                size={16}
                weight="bold"
                className="text-muted-foreground group-hover:text-primary transition-colors duration-200"
              />
            </button>
          </div>
        )}
      </div>

      <AddColumnDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        tableId={tableId}
      />
    </>
  );
}

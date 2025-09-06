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
}

export function TableHeader({
  columns,
  showRowNumbers = true,
  showSelectAll = true,
  showActionColumn = true,
  tableId,
}: TableHeaderProps) {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <div className="flex border-b border-border bg-muted rounded-t-lg">
        {/* Sticky row numbers/select all */}
        {showRowNumbers && (
          <div className="sticky left-0 z-10 flex-shrink-0 bg-muted rounded-tl-lg">
            {showSelectAll ? (
              <TableSelectAll />
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

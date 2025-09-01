"use client";

import { useState } from "react";
import { Column, Row, TableConfiguration } from "@/lib/types";
import { useDatabase } from "@/lib/db";
import { TableCell } from "./table-cell";
import { TableRowNumber } from "./table-row-number";
import { DotsThree } from "@phosphor-icons/react";

interface TableRowProps {
  readonly row: Row;
  readonly columns: Column[];
  readonly index: number;
  readonly showRowNumbers?: boolean;
  readonly showActionColumn?: boolean;
  readonly customRenderers?: Map<
    string,
    import("@/lib/types").ColumnRenderer<unknown>
  >;
  readonly onRowAction?: (action: string, rowId: Row["id"]) => void;
  readonly config?: TableConfiguration;
}

export function TableRow({
  row,
  columns,
  index,
  showRowNumbers = true,
  showActionColumn = true,
  customRenderers,
  onRowAction,
  config,
}: TableRowProps) {
  const { getCell, updateCell, createCell } = useDatabase();
  const [showMenu, setShowMenu] = useState(false);

  const handleCellChange = (columnId: Column["id"], value: unknown) => {
    const existingCell = getCell(row.id, columnId);

    if (existingCell) {
      updateCell(existingCell.id, value);
    } else {
      createCell(row.id, columnId, value);
    }
  };

  const handleRowAction = (action: string) => {
    onRowAction?.(action, row.id);
    setShowMenu(false);
  };

  return (
    <div className="flex border-b border-border last:border-b-0" data-row-id={row.id}>
      {/* Sticky row number */}
      {showRowNumbers && (
        <div className="sticky left-0 z-10 flex-shrink-0 bg-background">
          <TableRowNumber row={row} index={index} />
        </div>
      )}

      {/* Scrollable cells */}
      <div className="flex flex-1 min-w-0">
        {columns.map((column, index) => {
          const cell = getCell(row.id, column.id);
          const isLastColumn = index === columns.length - 1;

          return (
            <div
              key={`${row.id}-${column.id}`}
              className={`flex-1 min-w-[120px] ${!isLastColumn ? 'border-r border-border' : ''}`}
              style={{ minWidth: Math.max(column.width || 120, 120) }}
            >
              <TableCell
                cell={cell}
                column={column}
                row={row}
                onValueChange={(value) => handleCellChange(column.id, value)}
                customRenderers={config?.renderers || customRenderers}
                config={config}
              />
            </div>
          );
        })}
      </div>

      {/* Sticky action column */}
      {showActionColumn && (
        <div className="sticky right-0 z-10 flex-shrink-0 bg-background">
          <div className="h-10 w-12 border-l border-border flex items-center justify-center bg-background group hover:bg-muted/40 transition-colors relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-100 transition-all duration-200 p-1.5 hover:bg-muted/60 rounded"
            >
              <DotsThree
                size={16}
                weight="bold"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              />
            </button>
          </div>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setShowMenu(false)}
              />
              {/* Menu */}
              <div className="absolute top-full right-0 z-[9999] mt-1 bg-background border border-border rounded-md shadow-xl min-w-[130px] transform -translate-x-full">
                <div className="py-1">
                  <button
                    onClick={() => handleRowAction("duplicate")}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors font-medium"
                  >
                    Duplicate Row
                  </button>
                  <button
                    onClick={() => handleRowAction("delete")}
                    className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                  >
                    Delete Row
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
}

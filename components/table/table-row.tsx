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
    <div className="flex">
      {showRowNumbers && <TableRowNumber row={row} index={index} />}

      {columns.map((column) => {
        const cell = getCell(row.id, column.id);

        return (
          <TableCell
            key={`${row.id}-${column.id}`}
            cell={cell}
            column={column}
            row={row}
            onValueChange={(value) => handleCellChange(column.id, value)}
            customRenderers={config?.renderers || customRenderers}
            config={config}
          />
        );
      })}

      {showActionColumn && (
        <div className="relative ml-auto">
          <div className="h-10 w-16 border-l-2 border-border flex items-center justify-center bg-background group hover:bg-muted/30 transition-colors">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-muted rounded"
            >
              <DotsThree
                size={14}
                weight="bold"
                className="text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
              />
            </button>
          </div>

          {showMenu && (
            <div className="absolute top-full right-0 z-[9999] mt-1 bg-background border border-border rounded-md shadow-lg min-w-[120px]">
              <div className="py-1">
                <button
                  onClick={() => handleRowAction("duplicate")}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted/80 transition-colors"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleRowAction("delete")}
                  className="w-full px-3 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Delete
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-3 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showMenu && (
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMenu(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

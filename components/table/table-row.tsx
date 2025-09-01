"use client";

import { useState } from "react";
import { Column, Row, TableConfiguration } from "@/lib/types";
import { useDatabase } from "@/lib/db";
import { TableCell } from "./table-cell";
import { TableRowNumber } from "./table-row-number";
import { DotsThree, Copy, Trash } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-12 border-l border-border flex items-center justify-center bg-background hover:bg-muted/40 data-[state=open]:bg-muted/40 transition-colors focus:outline-none">
                <DotsThree
                  size={16}
                  weight="bold"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end" sideOffset={8} avoidCollisions={true}>
              <DropdownMenuItem onClick={() => handleRowAction("duplicate")} className="gap-2 py-2 hover:bg-muted/60">
                <Copy size={14} className="text-muted-foreground" />
                <span className="flex-1 whitespace-nowrap">Duplicate</span>
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                variant="destructive"
                onClick={() => handleRowAction("delete")}
                className="gap-2 py-2"
              >
                <Trash size={14} />
                <span className="flex-1 whitespace-nowrap">Delete</span>
                <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

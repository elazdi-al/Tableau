"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column, Row, useCollectionStore } from "@/lib/local-table";
import { RendererRegistry } from "@/lib/types";
import { Copy, DotsThree, Trash } from "@phosphor-icons/react";
import { TableCell } from "./table-cell";
import { TableRowNumber } from "./table-row-number";

interface TableRowProps {
  readonly row: Row;
  readonly columns: Column[];
  readonly index: number;
  readonly showRowNumbers?: boolean;
  readonly showActionColumn?: boolean;
  readonly onRowAction?: (action: string, rowId: string) => void;
  readonly renderers?: RendererRegistry;
}

export function TableRow({
  row,
  columns,
  index,
  showRowNumbers = true,
  showActionColumn = true,
  onRowAction,
  renderers,
}: TableRowProps) {
  const store = useCollectionStore();

  const handleCellChange = (columnId: string, value: unknown) => {
    store.updateCellValue(row.id, columnId, value);
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
          const cellValue = row.data[column.id];
          const isLastColumn = index === columns.length - 1;

          return (
            <div
              key={`${row.id}-${column.id}`}
              className={`flex-1 min-w-[120px] ${!isLastColumn ? 'border-r border-border' : ''}`}
              style={{ minWidth: Math.max(column.width || 120, 120) }}
            >
              <TableCell
                value={cellValue}
                column={column}
                row={row}
                onValueChange={(value) => handleCellChange(column.id, value)}
                renderers={renderers}
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

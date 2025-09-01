"use client";

import { useState } from "react";
import { Column, TableConfiguration } from "@/lib/types";
import { TableSelectAll } from "./table-select-all";
import { PlusIcon } from "@phosphor-icons/react";

interface TableHeaderProps {
  readonly columns: Column[];
  readonly showRowNumbers?: boolean;
  readonly showSelectAll?: boolean;
  readonly showActionColumn?: boolean;
  readonly onAddColumn?: (type: string) => void;
  readonly config?: TableConfiguration;
}

export function TableHeader({
  columns,
  showRowNumbers = true,
  showSelectAll = true,
  showActionColumn = true,
  onAddColumn,
  config,
}: TableHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAddColumn = (type: string) => {
    onAddColumn?.(type);
    setShowMenu(false);
  };

  const availableTypes = config?.getAvailableTypes() || [];
  return (
    <div className="flex border-b-2 border-border bg-muted/30">
      <div className="flex flex-1">
        {showRowNumbers && showSelectAll && <TableSelectAll />}
        {showRowNumbers && !showSelectAll && (
          <div className="h-10 w-12 border-r border-b-2 border-border bg-muted/50" />
        )}

        {columns.map((column) => {
          const headerAlignment =
            config?.getHeaderAlignment(column.type) || "left";
          return (
            <div
              key={column.id}
              className="h-10 border-r border-border flex items-center px-3 font-medium text-sm bg-muted/50"
              style={{ width: column.width }}
            >
              <span className={`truncate w-full text-${headerAlignment}`}>
                {column.name}
              </span>
            </div>
          );
        })}
      </div>

      {showActionColumn && (
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-10 w-16 border-l border-border flex items-center justify-center bg-muted/30 group hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <PlusIcon
              size={14}
              weight="bold"
              className="text-muted-foreground/60 group-hover:text-foreground transition-colors duration-200"
            />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 z-[9999] mt-1 bg-background border border-border rounded-md shadow-lg min-w-[120px]">
              <div className="py-1">
                {availableTypes.map((typeDef) => (
                  <button
                    key={typeDef.type}
                    onClick={() => handleAddColumn(typeDef.type)}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted/80 transition-colors flex items-center gap-2"
                  >
                    {typeDef.icon && (
                      <typeDef.icon
                        size={14}
                        className="text-muted-foreground"
                      />
                    )}
                    <span>{typeDef.label}</span>
                  </button>
                ))}
                {availableTypes.length > 0 && (
                  <div className="h-px bg-border my-1" />
                )}
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

"use client";

import { useState, useCallback } from "react";
import {
  Cell,
  Column,
  Row,
  ColumnRenderer,
  TableConfiguration,
} from "@/lib/types";
import { getRenderer } from "./renderers";

interface TableCellProps {
  readonly cell: Cell | undefined;
  readonly column: Column;
  readonly row: Row;
  readonly onValueChange: (value: unknown) => void;
  readonly customRenderers?: Map<string, ColumnRenderer<unknown>>;
  readonly config?: TableConfiguration;
}

export function TableCell({
  cell,
  column,
  row,
  onValueChange,
  customRenderers,
  config,
}: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);

  const value = cell?.value ?? null;

  const handleStartEdit = useCallback(() => {
    if (!column.readonly) {
      setIsEditing(true);
    }
  }, [column.readonly]);

  const handleEndEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleValueChange = useCallback(
    (newValue: unknown) => {
      onValueChange(newValue);
      setIsEditing(false);
    },
    [onValueChange],
  );

  // Get the appropriate renderer for this column type
  const renderer = getRenderer(column.type, customRenderers);
  const typeDefinition = config?.typeRegistry?.getType(column.type);

  if (!renderer) {
    // Fallback for unknown column types
    return (
      <div
        className={`
          relative h-10 bg-background transition-colors duration-200 w-full
          ${row.selected ? "bg-primary/3" : "hover:bg-muted/20"}
        `}
      >
        <div className="h-full flex items-center px-3 py-2 text-sm">
          <span className="text-muted-foreground italic">
            Unknown type: {column.type}
          </span>
        </div>
      </div>
    );
  }

  const RendererComponent = renderer.component;

  return (
    <div
      className={`
        relative h-10 bg-background transition-colors duration-200 w-full
        ${row.selected ? "bg-primary/5 border-primary/10" : "hover:bg-muted/30"}
        ${isEditing ? "z-10 bg-background ring-1 ring-primary/40 ring-inset" : "z-0"}
      `}
      onClick={handleStartEdit}
    >
      {/* Cell content */}
      <div className="h-full">
        <RendererComponent
          value={value}
          onChange={handleValueChange}
          column={column}
          typeDefinition={
            typeDefinition || {
              type: column.type,
              category: "custom",
              label: column.type,
              defaultValue: null,
              alignment: "left",
              validate: (v) => v,
            }
          }
          readonly={column.readonly}
          editing={isEditing}
        />
      </div>
    </div>
  );
}

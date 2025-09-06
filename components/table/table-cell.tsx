"use client";

import { useState, useCallback } from "react";
import { Column, Row } from "@/lib/local-table";
import { getRenderer } from "@/lib/renderers";
import { RendererRegistry } from "@/lib/types";

interface TableCellProps {
  readonly value: unknown;
  readonly column: Column;
  readonly row: Row;
  readonly onValueChange: (value: unknown) => void;
  readonly renderers?: RendererRegistry;
  readonly readonly?: boolean;
}

export function TableCell({
  value,
  column,
  row,
  onValueChange,
  renderers,
  readonly = false
}: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartEdit = useCallback(() => {
    if (!readonly) {
      setIsEditing(true);
    }
  }, [readonly]);

  const handleCellClick = useCallback(() => {
    handleStartEdit();
  }, [handleStartEdit]);

  const handleValueChange = useCallback((newValue: unknown) => {
    onValueChange(newValue);
    setIsEditing(false);
  }, [onValueChange]);

  // Get renderer from registry - this should always exist for supported types
  const renderer = renderers ? getRenderer(renderers, column.type) : undefined;

  if (!renderer) {
    return (
      <div className="h-10 w-full flex items-center px-3 py-2 text-sm bg-destructive/10">
        <span className="text-destructive text-xs">
          No renderer for type: {column.type}
        </span>
      </div>
    );
  }

  const RendererComponent = renderer.component;
  return (
    <div
      className="h-10 w-full cursor-text"
      onClick={handleCellClick}
    >
      <RendererComponent
        value={renderer.validate(value)}
        onChange={handleValueChange}
        column={column}
        row={row}
        editing={isEditing}
        readonly={readonly}
      />
    </div>
  );
}

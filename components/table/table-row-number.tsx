"use client";

import { CheckIcon } from '@phosphor-icons/react';
import { Row } from '@/lib/local-table';
import { memo } from 'react';

interface TableRowNumberProps {
  readonly row: Row;
  readonly index: number;
  readonly className?: string;
  readonly enableSelection?: boolean;
  readonly isSelected?: boolean;
  readonly onToggleSelection?: (rowId: string) => void;
}

export const TableRowNumber = memo(function TableRowNumber({
  row,
  index,
  className = "",
  enableSelection = false,
  isSelected = false,
  onToggleSelection
}: TableRowNumberProps) {
  const bgClass = isSelected ? 'bg-primary/8 text-primary cursor-pointer' : 'bg-muted/30 hover:bg-muted/50';
  const cursorClass = enableSelection ? 'cursor-pointer' : '';
  const numberOpacity = enableSelection && !isSelected ? 'group-hover:opacity-0' : '';
  const checkOpacity = isSelected ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 text-muted-foreground/50';

  return (
    <div
      className={`group relative flex items-center justify-center h-10 w-12 border-r border-border text-sm text-muted-foreground ${bgClass} ${cursorClass} ${className}`}
      onClick={() => enableSelection && onToggleSelection?.(row.id)}
    >
      {/* Row Number - hidden on hover when selection enabled and not selected */}
      <span className={`text-xs font-mono ${numberOpacity} ${isSelected ? 'opacity-0' : ''}`}>
        {index + 1}
      </span>

      {/* Checkmark - shows on hover or when selected */}
      {enableSelection && (
        <CheckIcon
          size={16}
          weight={isSelected ? "bold" : "regular"}
          className={`absolute ${checkOpacity}`}
        />
      )}

      <span className="sr-only">
        {enableSelection ? `Select row ${index + 1}` : `Row ${index + 1}`}
      </span>
    </div>
  );
});

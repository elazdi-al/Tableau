"use client";

import { useState } from 'react';
import { Check } from '@phosphor-icons/react';
import { Row } from '@/lib/local-table';

interface TableRowNumberProps {
  readonly row: Row;
  readonly index: number;
  readonly className?: string;
  readonly enableSelection?: boolean;
  readonly isSelected?: boolean;
  readonly onToggleSelection?: (rowId: string) => void;
}

export function TableRowNumber({
  row,
  index,
  className = "",
  enableSelection = false,
  isSelected = false,
  onToggleSelection
}: TableRowNumberProps) {
  const [isHovered, setIsHovered] = useState(false);

  const showCheckmark = isHovered || isSelected;

  return (
    <div
      className={`
        group relative flex items-center justify-center h-10 w-12 border-r border-border
        text-sm text-muted-foreground transition-all duration-200
        ${isSelected
          ? 'bg-primary/8 text-primary cursor-pointer'
          : 'bg-muted/30 hover:bg-muted/50'
        }
        ${enableSelection ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={() => enableSelection && onToggleSelection?.(row.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Number - shows when not hovering/selected */}
      <span
        className={`
          absolute text-xs font-mono transition-all duration-200
          ${showCheckmark && enableSelection ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {index + 1}
      </span>

      {/* Checkmark - shows on hover/selection */}
      {enableSelection && (
        <div
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-200
            ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          <Check
            size={16}
            weight={isSelected ? "bold" : "regular"}
            className={`
              transition-colors duration-200
              ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}
            `}
          />
        </div>
      )}

      <span className="sr-only">
        {enableSelection ? `Select row ${index + 1}` : `Row ${index + 1}`}
      </span>
    </div>
  );
}

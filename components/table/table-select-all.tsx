"use client";

import { Check, Minus } from "@phosphor-icons/react";

interface TableSelectAllProps {
  readonly className?: string;
  readonly isAllSelected?: boolean;
  readonly hasPartialSelection?: boolean;
  readonly onToggleSelectAll?: () => void;
}

export function TableSelectAll({
  className = "",
  isAllSelected = false,
  hasPartialSelection = false,
  onToggleSelectAll
}: TableSelectAllProps) {

  return (
    <div
      className={`
        group flex items-center justify-center h-10 w-12 border-r border-border
        cursor-pointer transition-all duration-200
        ${
          isAllSelected || hasPartialSelection
            ? "bg-primary/8 hover:bg-primary/12"
            : "bg-muted/30 hover:bg-muted/50"
        }
        ${className}
      `}
      onClick={onToggleSelectAll}
    >
      {isAllSelected ? (
        <Check
          size={16}
          weight="bold"
          className="text-primary transition-colors duration-200"
        />
      ) : hasPartialSelection ? (
        <Minus
          size={16}
          weight="bold"
          className="text-primary transition-colors duration-200"
        />
      ) : (
        <>
          {/* Show hashtag when not hovered, checkmark when hovered */}
          <span className="text-muted-foreground/50 text-sm font-medium group-hover:hidden transition-all duration-200">
            #
          </span>
          <Check
            size={16}
            weight="light"
            className="hidden text-muted-foreground/60 group-hover:block transition-all duration-200"
          />
        </>
      )}

      <span className="sr-only">
        {isAllSelected ? "Deselect all rows" : "Select all rows"}
      </span>
    </div>
  );
}

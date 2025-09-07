"use client";

import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import { memo } from "react";

interface TableSelectAllProps {
  readonly className?: string;
  readonly isAllSelected?: boolean;
  readonly hasPartialSelection?: boolean;
  readonly onToggleSelectAll?: () => void;
}

export const TableSelectAll = memo(function TableSelectAll({
  className = "",
  isAllSelected = false,
  hasPartialSelection = false,
  onToggleSelectAll
}: TableSelectAllProps) {
  return (
    <div
      className={`
        group flex items-center justify-center h-10 w-12 border-r border-border
        cursor-pointer
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
        <CheckIcon
          size={16}
          weight="bold"
          className="text-primary"
        />
      ) : hasPartialSelection ? (
        <MinusIcon
          size={16}
          weight="bold"
          className="text-primary"
        />
      ) : (
        <>
          {/* Show hashtag when not hovered, checkmark when hovered */}
          <span className="text-muted-foreground/50 text-sm font-medium group-hover:opacity-0">
            #
          </span>
          <CheckIcon
            size={16}
            weight="light"
            className="absolute opacity-0 text-muted-foreground/60 group-hover:opacity-100"
          />
        </>
      )}

      <span className="sr-only">
        {isAllSelected ? "Deselect all rows" : "Select all rows"}
      </span>
    </div>
  );
});

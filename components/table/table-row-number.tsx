"use client";

import { useState } from 'react';
import { Check } from '@phosphor-icons/react';
import { Row } from '@/lib/local-table';

interface TableRowNumberProps {
  readonly row: Row;
  readonly index: number;
  readonly className?: string;
}

export function TableRowNumber({ row, index, className = "" }: TableRowNumberProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        group relative flex items-center justify-center h-10 w-12 border-r border-border
        text-sm text-muted-foreground transition-all duration-200
        bg-muted/30 hover:bg-muted/50
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Number */}
      <span className="text-xs font-mono">
        {index + 1}
      </span>

      <span className="sr-only">
        Row {index + 1}
      </span>
    </div>
  );
}

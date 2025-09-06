"use client";

import React from "react";
import { CellRenderer, CellRendererProps } from "@/lib/types";

const BooleanRenderer: React.FC<CellRendererProps<boolean>> = ({
  value,
  onChange,
  editing,
  readonly = false,
}) => {
  const handleToggle = () => {
    if (!readonly) {
      onChange(!value);
    }
  };

  return (
    <div className="h-full flex items-center justify-center px-3 py-2 text-sm">
      <button
        onClick={handleToggle}
        disabled={readonly}
        className={`
          w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
          ${value
            ? "bg-primary border-primary text-primary-foreground"
            : "bg-background border-border hover:border-muted-foreground"
          }
          ${readonly ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}
        `}
      >
        {value && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export const booleanRenderer: CellRenderer<boolean> = {
  component: BooleanRenderer,
  validate: (value: unknown) => Boolean(value),
  defaultValue: false,
  format: (value: boolean) => value ? "Yes" : "No",
};

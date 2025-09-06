"use client";

import React from "react";
import { CellRenderer, CellRendererProps } from "@/lib/renderers";

const SelectRenderer: React.FC<CellRendererProps<string>> = ({
  value,
  onChange,
  editing,
  readonly = false,
}) => {
  // Default options - in a real implementation, these could come from column config
  const options = ["Option 1", "Option 2", "Option 3"];

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm">
        <span className={value ? "text-foreground" : "text-muted-foreground italic"}>
          {value || "Select option..."}
        </span>
      </div>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={readonly}
      className="h-full w-full px-3 py-2 text-sm border-0 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 bg-background"
      autoFocus
    >
      <option value="">Select option...</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export const selectRenderer: CellRenderer<string> = {
  component: SelectRenderer,
  validate: (value: unknown) => String(value || ""),
  defaultValue: "",
};

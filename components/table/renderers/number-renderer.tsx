"use client";

import React, { useState, useEffect, useRef } from "react";
import { CellRenderer, CellRendererProps } from "@/lib/types";
import { Input } from "@/components/ui/input";

const NumberRenderer: React.FC<CellRendererProps<number>> = ({
  value,
  onChange,
  editing,
  readonly = false,
}) => {
  const [editValue, setEditValue] = useState(String(value || 0));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setEditValue(String(value || 0));
  }, [value]);

  const handleSubmit = () => {
    const num = parseFloat(editValue);
    const validNum = isNaN(num) ? 0 : num;
    onChange(validNum);
  };

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm justify-end">
        <span className="text-foreground">
          {typeof value === "number" ? value.toLocaleString() : "0"}
        </span>
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="number"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setEditValue(String(value || 0));
        }
      }}
      disabled={readonly}
      className="h-full border-0 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 text-right"
    />
  );
};

export const numberRenderer: CellRenderer<number> = {
  component: NumberRenderer,
  validate: (value: unknown) => {
    const num = parseFloat(String(value));
    return isNaN(num) ? 0 : num;
  },
  defaultValue: 0,
  format: (value: number) => value.toLocaleString(),
};

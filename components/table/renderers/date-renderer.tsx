"use client";

import React, { useState, useEffect, useRef } from "react";
import { CellRenderer, CellRendererProps } from "@/lib/types";
import { Input } from "@/components/ui/input";

const DateRenderer: React.FC<CellRendererProps<Date>> = ({
  value,
  onChange,
  editing,
  readonly = false,
}) => {
  const [editValue, setEditValue] = useState(
    value ? new Date(value).toISOString().split('T')[0] : ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    setEditValue(value ? new Date(value).toISOString().split('T')[0] : "");
  }, [value]);

  const handleSubmit = () => {
    if (editValue) {
      onChange(new Date(editValue));
    } else {
      onChange(new Date());
    }
  };

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm">
        <span className="text-foreground">
          {value ? new Date(value).toLocaleDateString() : "No date"}
        </span>
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      type="date"
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
          setEditValue(value ? new Date(value).toISOString().split('T')[0] : "");
        }
      }}
      disabled={readonly}
      className="h-full border-0 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
    />
  );
};

export const dateRenderer: CellRenderer<Date> = {
  component: DateRenderer,
  validate: (value: unknown) => {
    if (value instanceof Date) return value;
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? new Date() : date;
  },
  defaultValue: new Date(),
  format: (value: Date) => value.toLocaleDateString(),
};

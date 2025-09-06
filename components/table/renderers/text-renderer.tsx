"use client";

import React, { useState, useEffect, useRef } from "react";
import { CellRenderer, CellRendererProps } from "@/lib/types";
import { Input } from "@/components/ui/input";

const TextRenderer: React.FC<CellRendererProps<string>> = ({
  value,
  onChange,
  editing,
  readonly = false,
}) => {
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setEditValue(value || "");
  }, [value]);

  const handleSubmit = () => {
    onChange(editValue);
  };

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm">
        <span className={value ? "text-foreground" : "text-muted-foreground italic"}>
          {value || "Click to edit..."}
        </span>
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
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
          setEditValue(value || "");
        }
      }}
      disabled={readonly}
      className="h-full border-0 rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
      placeholder="Enter text..."
    />
  );
};

export const textRenderer: CellRenderer<string> = {
  component: TextRenderer,
  validate: (value: unknown) => String(value || ""),
  defaultValue: "",
};

"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { TableEditor } from "@/components/table";
import { createTableConfig, defineRenderer } from "@/lib/config";
import React, { useState, useRef, useEffect } from "react";

// Create default renderers for the main page
const TextRenderer: React.FC<
  import("@/lib/types").CellRendererProps<string>
> = ({ value, onChange, readonly, editing, typeDefinition, column }) => {
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder =
    (column.config?.placeholder as string) ||
    (typeDefinition.defaultConfig?.placeholder as string) ||
    "Enter text...";

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        className={`h-full flex items-center px-3 py-2 text-sm justify-${typeDefinition.alignment}`}
      >
        <span className={value ? "" : "text-muted-foreground italic"}>
          {value || "Click to edit..."}
        </span>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onChange(editValue)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onChange(editValue);
        if (e.key === "Escape") onChange(value || "");
      }}
      disabled={readonly}
      className={`w-full h-full px-3 py-2 text-sm border-none outline-none bg-transparent text-${typeDefinition.alignment}`}
      placeholder={placeholder}
    />
  );
};

const NumberRenderer: React.FC<
  import("@/lib/types").CellRendererProps<number>
> = ({ value, onChange, readonly, editing, typeDefinition, column }) => {
  const [editValue, setEditValue] = useState(String(value || 0));
  const inputRef = useRef<HTMLInputElement>(null);
  const min = column.config?.min as number;
  const max = column.config?.max as number;
  const step = (column.config?.step as number) || 1;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <div
        className={`h-full flex items-center px-3 py-2 text-sm justify-${typeDefinition.alignment}`}
      >
        <span>
          {typeDefinition.format ? typeDefinition.format(value) : value || 0}
        </span>
      </div>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      value={editValue}
      min={min}
      max={max}
      step={step}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => {
        const num = parseFloat(editValue);
        const validNum = isNaN(num) ? 0 : num;
        const clampedNum =
          min !== undefined ? Math.max(min, validNum) : validNum;
        const finalNum =
          max !== undefined ? Math.min(max, clampedNum) : clampedNum;
        onChange(finalNum);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const num = parseFloat(editValue);
          const validNum = isNaN(num) ? 0 : num;
          const clampedNum =
            min !== undefined ? Math.max(min, validNum) : validNum;
          const finalNum =
            max !== undefined ? Math.min(max, clampedNum) : clampedNum;
          onChange(finalNum);
        }
        if (e.key === "Escape") onChange(value || 0);
      }}
      disabled={readonly}
      className={`w-full h-full px-3 py-2 text-sm border-none outline-none bg-transparent text-${typeDefinition.alignment}`}
    />
  );
};

// Create master configuration with custom renderers
const masterConfig = createTableConfig({
  showRowNumbers: true,
  showSelectAll: true,
  enableSelection: true,
  enableEditing: true,
  showActionColumn: true,
  density: "normal",
  striped: false,
})
  .addRenderer({
    type: "text",
    component: TextRenderer,
    validate: (value) => String(value || ""),
    defaultValue: "",
  })
  .addRenderer({
    type: "number",
    component: NumberRenderer,
    validate: (value) => {
      const num = parseFloat(String(value));
      return isNaN(num) ? 0 : num;
    },
    defaultValue: 0,
  })
  .availableTypes("text", "number")
  .defaultType("text");

const tableConfig = masterConfig.build();

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4">
      <div className="text-center max-w-2xl mb-16">
        <h1
          className="text-5xl md:text-6xl font-normal mb-4 tracking-tighter"
          style={{ fontFamily: "'Crimson Text', serif" }}
        >
          Tableau
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
          A lightweight and composable React component for quickly making table
          editors
        </p>
      </div>

      <div className="w-full max-w-l">
        <div className="h-4 border-t-2 border-dashed border-border mb-16" />
      </div>
      <div className="w-full max-w-4xl">
        <div className="overflow-visible">
          <TableEditor config={tableConfig} />
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
}

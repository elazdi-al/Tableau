"use client"
import { ThemeToggle } from "@/components/theme-toggle";
import { TableEditor } from "@/components/table";
import { table } from "@/lib/config";
import { createRenderer } from "@/components/table/renderers";
import React, { useState, useRef, useEffect } from 'react';

// Create default renderers for the main page
const TextRenderer: React.FC<import('@/lib/types').CellRendererProps<string>> = ({ value, onChange, readonly, editing }) => {
  const [editValue, setEditValue] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm">
        <span className={value ? '' : 'text-muted-foreground italic'}>
          {value || 'Click to edit...'}
        </span>
      </div>
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onChange(editValue)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onChange(editValue)
        if (e.key === 'Escape') onChange(value || '')
      }}
      disabled={readonly}
      className="w-full h-full px-3 py-2 text-sm border-none outline-none bg-transparent"
      placeholder="Enter text..."
    />
  )
}

const NumberRenderer: React.FC<import('@/lib/types').CellRendererProps<number>> = ({ value, onChange, readonly, editing }) => {
  const [editValue, setEditValue] = useState(String(value || 0))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (!editing) {
    return (
      <div className="h-full flex items-center px-3 py-2 text-sm justify-end">
        <span>{value || 0}</span>
      </div>
    )
  }

  return (
    <input
      ref={inputRef}
      type="number"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => {
        const num = parseFloat(editValue)
        onChange(isNaN(num) ? 0 : num)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const num = parseFloat(editValue)
          onChange(isNaN(num) ? 0 : num)
        }
        if (e.key === 'Escape') onChange(value || 0)
      }}
      disabled={readonly}
      className="w-full h-full px-3 py-2 text-sm border-none outline-none bg-transparent text-right"
    />
  )
}

const textRenderer = createRenderer('custom-text', TextRenderer, (value) => String(value || ''), '')
const numberRenderer = createRenderer('custom-number', NumberRenderer, (value) => {
  const num = parseFloat(String(value))
  return isNaN(num) ? 0 : num
}, 0)

const defaultConfig = table()
  .addRenderer(textRenderer)
  .addRenderer(numberRenderer)
  .build()

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 px-4">
      <div className="text-center max-w-2xl mb-16">
        <h1 
          className="text-5xl md:text-6xl font-normal mb-4 tracking-tight"
          style={{ fontFamily: "'Crimson Text', serif" }}
        >
          Tableau
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
          A lightweight and composable React component for quickly making table editors
        </p>
      </div>
      
      <div className="w-full max-w-4xl">
        <div className="h-px bg-border mb-16" />
        <TableEditor 
          config={defaultConfig.options}
          renderers={defaultConfig.renderers}
        />
      </div>
      
      <ThemeToggle />
    </div>
  );
}

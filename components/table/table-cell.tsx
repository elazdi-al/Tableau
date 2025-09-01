"use client"

import { useState, useCallback } from 'react'
import { Cell, Column, Row, ColumnRenderer } from '@/lib/types'
import { getRenderer } from './renderers'

interface TableCellProps {
  readonly cell: Cell | undefined
  readonly column: Column
  readonly row: Row
  readonly onValueChange: (value: unknown) => void
  readonly customRenderers?: Map<string, ColumnRenderer<unknown>>
}

export function TableCell({ 
  cell, 
  column, 
  row, 
  onValueChange,
  customRenderers 
}: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false)

  const value = cell?.value ?? null

  const handleStartEdit = useCallback(() => {
    if (!column.readonly) {
      setIsEditing(true)
    }
  }, [column.readonly])

  const handleEndEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleValueChange = useCallback((newValue: unknown) => {
    onValueChange(newValue)
    setIsEditing(false)
  }, [onValueChange])

  // Get the appropriate renderer for this column type
  const renderer = getRenderer(column.type, customRenderers)

  if (!renderer) {
    // Fallback for unknown column types
    return (
      <div
        className={`
          relative h-10 bg-background transition-colors duration-200
          ${row.selected ? 'bg-primary/3' : 'hover:bg-muted/20'}
        `}
        style={{ width: column.width }}
      >
        <div className="h-full border-r border-b border-border flex items-center px-3 py-2 text-sm">
          <span className="text-muted-foreground italic">
            Unknown type: {column.type}
          </span>
        </div>
      </div>
    )
  }

  const RendererComponent = renderer.component

  return (
    <div
      className={`
        relative h-10 bg-background transition-colors duration-200
        ${row.selected ? 'bg-primary/3' : 'hover:bg-muted/20'}
        ${isEditing ? 'z-10' : 'z-0'}
      `}
      style={{ width: column.width }}
      onClick={handleStartEdit}
    >
      {/* Cell content */}
      <div
        className={`
          h-full border-r border-b border-border transition-all duration-200
          ${isEditing 
            ? 'border-muted-foreground/20 bg-background/80 backdrop-blur-sm shadow-sm' 
            : ''
          }
        `}
      >
        <RendererComponent
          value={value}
          onChange={handleValueChange}
          column={column}
          readonly={column.readonly}
          editing={isEditing}
        />
      </div>
    </div>
  )
}
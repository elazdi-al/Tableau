"use client"

import { useState, useCallback, useEffect } from 'react'
import { ColumnType, Cell, Column, Row } from '@/lib/types'

interface TableCellProps {
  readonly cell: Cell | undefined
  readonly column: Column
  readonly row: Row
  readonly onValueChange: (value: unknown) => void
}

export function TableCell({ cell, column, row, onValueChange }: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')

  const value = cell?.value ?? ''
  const displayValue = String(value)

  useEffect(() => {
    setEditValue(displayValue)
  }, [displayValue])

  const handleSave = useCallback(() => {
    const processedValue = column.type === 'number' ? 
      (editValue === '' ? null : Number(editValue)) : 
      editValue
    
    onValueChange(processedValue)
    setIsEditing(false)
  }, [editValue, column.type, onValueChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(displayValue)
      setIsEditing(false)
    }
  }, [handleSave, displayValue])

  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    setEditValue(displayValue)
  }, [displayValue])

  const renderInput = () => (
    <input
      type={column.type === 'number' ? 'number' : 'text'}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className="w-full h-full bg-transparent border-none outline-none px-3 py-2 text-sm"
      autoFocus
      placeholder={column.isRequired ? `${column.name} (required)` : undefined}
    />
  )

  const renderDisplay = () => (
    <div
      className="w-full h-full px-3 py-2 cursor-text flex items-center text-sm"
      onClick={handleStartEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleStartEdit()}
    >
      <span className={`truncate ${!value ? 'text-muted-foreground italic' : ''}`}>
        {displayValue || 'Empty'}
      </span>
    </div>
  )

  return (
    <div
      className={`
        h-10 border-r border-b border-border bg-background transition-colors
        ${row.isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}
        ${isEditing ? 'ring-1 ring-primary/50' : ''}
      `}
      style={{ width: column.width }}
    >
      {isEditing ? renderInput() : renderDisplay()}
    </div>
  )
}
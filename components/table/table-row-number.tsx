"use client"

import { Row } from '@/lib/types'
import { useDatabase } from '@/lib/db'

interface TableRowNumberProps {
  readonly row: Row
  readonly index: number
  readonly className?: string
}

export function TableRowNumber({ row, index, className = "" }: TableRowNumberProps) {
  const { toggleRowSelection } = useDatabase()

  return (
    <div 
      className={`
        flex items-center justify-center h-10 w-12 border-r border-b border-border 
        bg-muted/30 text-sm text-muted-foreground cursor-pointer
        hover:bg-muted/50 transition-colors
        ${row.isSelected ? 'bg-primary/10 border-primary/20' : ''}
        ${className}
      `}
      onClick={() => toggleRowSelection(row.id)}
    >
      <div className="flex items-center space-x-1">
        <input
          type="checkbox"
          checked={row.isSelected}
          onChange={() => {}} // Handled by onClick
          className="w-3 h-3 accent-foreground"
          aria-label={`Select row ${index + 1}`}
        />
        <span className="text-xs font-mono">{index + 1}</span>
      </div>
    </div>
  )
}
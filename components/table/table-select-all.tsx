"use client"

import { Check, Minus } from '@phosphor-icons/react'
import { useDatabase } from '@/lib/db'

interface TableSelectAllProps {
  readonly className?: string
}

export function TableSelectAll({ className = "" }: TableSelectAllProps) {
  const { selection, toggleSelectAll } = useDatabase()
  
  const hasPartialSelection = selection.selectedRows.size > 0 && !selection.isAllSelected

  return (
    <div 
      className={`
        flex items-center justify-center h-10 w-12 border-r border-b-2 border-border 
        cursor-pointer transition-all duration-200
        ${selection.isAllSelected || hasPartialSelection
          ? 'bg-primary/6 border-primary/10 hover:bg-primary/10' 
          : 'bg-muted/20 hover:bg-muted/40'
        }
        ${className}
      `}
      onClick={toggleSelectAll}
    >
      {selection.isAllSelected ? (
        <Check 
          size={16} 
          weight="bold"
          className="text-primary transition-colors duration-200"
        />
      ) : hasPartialSelection ? (
        <Minus 
          size={16} 
          weight="bold"
          className="text-primary transition-colors duration-200"
        />
      ) : (
        <Check 
          size={16} 
          weight="light"
          className="text-muted-foreground/30 transition-colors duration-200 hover:text-muted-foreground/60"
        />
      )}
      
      <span className="sr-only">
        {selection.isAllSelected ? 'Deselect all rows' : 'Select all rows'}
      </span>
    </div>
  )
}
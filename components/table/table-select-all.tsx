"use client"

import { useDatabase } from '@/lib/db'

interface TableSelectAllProps {
  readonly className?: string
}

export function TableSelectAll({ className = "" }: TableSelectAllProps) {
  const { selection, toggleSelectAll } = useDatabase()

  return (
    <div 
      className={`
        flex items-center justify-center h-10 w-12 border-r border-b-2 border-border 
        bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors
        ${className}
      `}
      onClick={toggleSelectAll}
    >
      <input
        type="checkbox"
        checked={selection.isAllSelected}
        onChange={() => {}} // Handled by onClick
        className="w-4 h-4 accent-foreground"
        aria-label="Select all rows"
      />
    </div>
  )
}
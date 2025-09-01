"use client"

import { Column } from '@/lib/types'
import { TableSelectAll } from './table-select-all'

interface TableHeaderProps {
  readonly columns: Column[]
  readonly showRowNumbers?: boolean
  readonly showSelectAll?: boolean
}

export function TableHeader({ 
  columns, 
  showRowNumbers = true, 
  showSelectAll = true 
}: TableHeaderProps) {
  return (
    <div className="flex border-b-2 border-border bg-muted/30">
      {showRowNumbers && showSelectAll && <TableSelectAll />}
      {showRowNumbers && !showSelectAll && (
        <div className="h-10 w-12 border-r border-b-2 border-border bg-muted/50" />
      )}
      
      {columns.map((column) => (
        <div
          key={column.id}
          className="h-10 border-r border-border flex items-center px-3 font-medium text-sm bg-muted/50"
          style={{ width: column.width }}
        >
          <span className="truncate">{column.name}</span>
        </div>
      ))}
    </div>
  )
}
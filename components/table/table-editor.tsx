"use client"

import { useEffect, useState } from 'react'
import { useDatabase, initializeSampleData } from '@/lib/db'
import { TableId, createTableId } from '@/lib/types'
import { TableHeader } from './table-header'
import { TableRow } from './table-row'

interface TableEditorProps {
  readonly tableId?: TableId
  readonly showRowNumbers?: boolean
  readonly showSelectAll?: boolean
  readonly className?: string
}

export function TableEditor({ 
  tableId, 
  showRowNumbers = true, 
  showSelectAll = true,
  className = "" 
}: TableEditorProps) {
  const { getTableColumns, getTableRows, options } = useDatabase()
  const [currentTableId, setCurrentTableId] = useState<TableId | null>(tableId || null)
  
  // Use the provided tableId or initialize sample data
  useEffect(() => {
    if (!currentTableId) {
      const sampleTableId = initializeSampleData()
      setCurrentTableId(sampleTableId)
    }
  }, [currentTableId])

  if (!currentTableId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="animate-pulse">Initializing table...</div>
      </div>
    )
  }

  const columns = getTableColumns(currentTableId)
  const rows = getTableRows(currentTableId)

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div>No columns found</div>
      </div>
    )
  }

  const effectiveShowRowNumbers = showRowNumbers && options.showRowNumbers
  const effectiveShowSelectAll = showSelectAll && options.showSelectAll

  return (
    <div className={`w-full ${className}`}>
      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <TableHeader 
          columns={columns} 
          showRowNumbers={effectiveShowRowNumbers}
          showSelectAll={effectiveShowSelectAll}
        />
        <div className="bg-background">
          {rows.map((row, index) => (
            <TableRow 
              key={row.id.value} 
              row={row} 
              columns={columns} 
              index={index}
              showRowNumbers={effectiveShowRowNumbers}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
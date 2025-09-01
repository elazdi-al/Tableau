"use client"

import { useEffect, useState, useRef } from 'react'
import { useDatabase, initializeSampleData } from '@/lib/db'
import { TableId, TableOptions } from '@/lib/types'
import { calculateColumnWidths } from '@/lib/column-sizing'
import { TableHeader } from './table-header'
import { TableRow } from './table-row'

interface TableEditorProps {
  readonly tableId?: TableId
  readonly config?: Partial<TableOptions>
  readonly renderers?: Map<string, import('@/lib/types').ColumnRenderer>
  readonly className?: string
}

export function TableEditor({ 
  tableId,
  config = {},
  renderers,
  className = "" 
}: TableEditorProps) {
  const { getTableColumns, getTableRows, getCell, options, setOptions } = useDatabase()
  const [currentTableId, setCurrentTableId] = useState<TableId | null>(tableId || null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Apply config options to global state
  useEffect(() => {
    if (Object.keys(config).length > 0) {
      setOptions(config)
    }
  }, [config, setOptions])
  
  // Use the provided tableId or initialize sample data
  useEffect(() => {
    if (!currentTableId) {
      // Always initialize sample data if no tableId is provided
      const sampleTableId = initializeSampleData()
      setCurrentTableId(sampleTableId)
    }
  }, [currentTableId])

  const columns = currentTableId ? getTableColumns(currentTableId) : []
  const rows = currentTableId ? getTableRows(currentTableId) : []

  // Calculate column widths based on content and sizing mode
  useEffect(() => {
    if (!currentTableId || columns.length === 0 || !containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    
    const columnsData = columns.map(column => ({
      column,
      cellValues: rows.map(row => getCell(row.id, column.id)?.value)
    }))

    const calculatedWidths = calculateColumnWidths(columnsData, {
      mode: options.columnSizing,
      containerWidth,
      minColumnWidth: options.minColumnWidth,
      maxColumnWidth: options.maxColumnWidth,
      showRowNumbers: options.showRowNumbers
    })

    // Only update if widths actually changed
    setColumnWidths(prevWidths => {
      const hasChanged = Object.keys(calculatedWidths).some(
        key => prevWidths[key] !== calculatedWidths[key]
      ) || Object.keys(prevWidths).length !== Object.keys(calculatedWidths).length

      return hasChanged ? calculatedWidths : prevWidths
    })
  }, [
    currentTableId, 
    columns,
    rows, 
    options.columnSizing, 
    options.minColumnWidth, 
    options.maxColumnWidth,
    options.showRowNumbers,
    getCell
  ])

  if (!currentTableId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div className="animate-pulse">Initializing table...</div>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        <div>No columns found</div>
      </div>
    )
  }

  // Merge calculated widths with column data
  const columnsWithWidths = columns.map(column => ({
    ...column,
    width: columnWidths[column.id] || column.width
  }))

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <TableHeader 
          columns={columnsWithWidths} 
          showRowNumbers={options.showRowNumbers}
          showSelectAll={options.showSelectAll}
        />
        <div className="bg-background">
          {rows.map((row, index) => (
            <TableRow 
              key={row.id} 
              row={row} 
              columns={columnsWithWidths} 
              index={index}
              showRowNumbers={options.showRowNumbers}
              customRenderers={renderers}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
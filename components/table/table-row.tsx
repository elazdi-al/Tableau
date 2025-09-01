"use client"

import { Column, Row } from '@/lib/types'
import { useDatabase } from '@/lib/db'
import { TableCell } from './table-cell'
import { TableRowNumber } from './table-row-number'

interface TableRowProps {
  readonly row: Row
  readonly columns: Column[]
  readonly index: number
  readonly showRowNumbers?: boolean
  readonly customRenderers?: Map<string, import('@/lib/types').ColumnRenderer>
}

export function TableRow({ row, columns, index, showRowNumbers = true, customRenderers }: TableRowProps) {
  const { getCell, updateCell, createCell } = useDatabase()

  const handleCellChange = (columnId: Column['id'], value: unknown) => {
    const existingCell = getCell(row.id, columnId)
    
    if (existingCell) {
      updateCell(existingCell.id, value)
    } else {
      createCell(row.id, columnId, value)
    }
  }

  return (
    <div className="flex">
      {showRowNumbers && (
        <TableRowNumber row={row} index={index} />
      )}
      
      {columns.map((column) => {
        const cell = getCell(row.id, column.id)
        
        return (
          <TableCell
            key={`${row.id}-${column.id}`}
            cell={cell}
            column={column}
            row={row}
            onValueChange={(value) => handleCellChange(column.id, value)}
            customRenderers={customRenderers}
          />
        )
      })}
    </div>
  )
}
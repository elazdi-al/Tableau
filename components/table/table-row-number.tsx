"use client"

import { useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { Row } from '@/lib/types'
import { useDatabase } from '@/lib/db'

interface TableRowNumberProps {
  readonly row: Row
  readonly index: number
  readonly className?: string
}

export function TableRowNumber({ row, index, className = "" }: TableRowNumberProps) {
  const { toggleRowSelection, options } = useDatabase()
  const [isHovered, setIsHovered] = useState(false)
  
  const showCheckmark = isHovered || row.selected

  return (
    <div 
      className={`
        group relative flex items-center justify-center h-10 w-12 border-r border-border 
        text-sm text-muted-foreground cursor-pointer transition-all duration-200
        ${row.selected 
          ? 'bg-primary/8 text-primary' 
          : 'bg-muted/30 hover:bg-muted/50'
        }
        ${className}
      `}
      onClick={() => options.enableSelection && toggleRowSelection(row.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Row Number - shows when not hovering/selected */}
      <span 
        className={`
          absolute text-xs font-mono transition-all duration-200
          ${showCheckmark && options.enableSelection ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {index + 1}
      </span>
      
      {/* Checkmark - shows on hover/selection */}
      {options.enableSelection && (
        <div 
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-200
            ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
        >
          <Check 
            size={16} 
            weight={row.selected ? "bold" : "regular"}
            className={`
              transition-colors duration-200
              ${row.selected ? 'text-primary' : 'text-muted-foreground/50'}
            `}
          />
        </div>
      )}
      
      <span className="sr-only">
        {options.enableSelection ? `Select row ${index + 1}` : `Row ${index + 1}`}
      </span>
    </div>
  )
}
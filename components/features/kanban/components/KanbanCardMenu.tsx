"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardMenuProps {
  onEdit: () => void
  onDelete: () => void
}

export function KanbanCardMenu({ onEdit, onDelete }: KanbanCardMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-accent"
          )}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1"
        align="end"
        side="bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onEdit()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => {
              onDelete()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-blue-50 dark:hover:bg-blue-950/10 hover:text-blue-600 dark:hover:text-blue-500 transition-colors text-blue-600 dark:text-blue-500 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Excluir</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

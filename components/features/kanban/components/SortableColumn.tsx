"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanColumn as KanbanColumnType } from "../types/kanban.types"
import { KanbanColumn } from "./KanbanColumn"
import { COLUMN_TYPE } from "../utils/dnd.handlers"
import { cn } from "@/lib/utils"

interface SortableColumnProps {
  boardId: string
  column: KanbanColumnType
  onCreateCard?: () => void
}

export function SortableColumn({
  boardId,
  column,
  onCreateCard,
}: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: COLUMN_TYPE,
      columnId: column.id,
      boardId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "shrink-0 w-full md:w-[280px] lg:w-80",
        isDragging && "ring-2 ring-primary/50"
      )}
    >
      <KanbanColumn
        boardId={boardId}
        column={column}
        onCreateCard={onCreateCard}
        dragHandleProps={{
          attributes,
          listeners,
        }}
      />
    </div>
  )
}

"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard as KanbanCardType } from "../types/kanban.types"
import { KanbanCard } from "./KanbanCard"
import { CARD_TYPE } from "../utils/dnd.handlers"
import { cn } from "@/lib/utils"

interface KanbanCardDragWrapperProps {
  boardId: string
  card: KanbanCardType
  columnId: string
}

export function KanbanCardDragWrapper({
  boardId,
  card,
  columnId,
}: KanbanCardDragWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: card.id,
    data: {
      type: CARD_TYPE,
      cardId: card.id,
      columnId,
      boardId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      {isDragging && (
        <div className="h-[88px] rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 mb-3 animate-pulse" />
      )}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none",
          isDragging && "opacity-0",
          !isDragging && "cursor-grab active:cursor-grabbing"
        )}
        onClick={(e) => {
          // Previne drag quando clica em elementos interativos
          const target = e.target as HTMLElement
          if (
            target.closest("button") ||
            target.closest("[role='button']") ||
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest("select")
          ) {
            e.stopPropagation()
          }
        }}
      >
        <KanbanCard boardId={boardId} card={card} />
      </div>
    </>
  )
}

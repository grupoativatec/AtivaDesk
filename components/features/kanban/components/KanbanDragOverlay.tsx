"use client"

import { KanbanCard as KanbanCardType } from "../types/kanban.types"
import { KanbanCard } from "./KanbanCard"

interface KanbanDragOverlayProps {
  card: KanbanCardType
  boardId: string
}

export function KanbanDragOverlay({ card, boardId }: KanbanDragOverlayProps) {
  return (
    <div className="rotate-1 opacity-95 shadow-2xl scale-[1.02] ring-2 ring-primary/20">
      <KanbanCard boardId={boardId} card={card} />
    </div>
  )
}

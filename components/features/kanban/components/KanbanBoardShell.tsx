"use client"

import { useState } from "react"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanFiltersBar } from "./KanbanFiltersBar"
import { KanbanListView } from "./KanbanListView"
import { KanbanTopbar, ViewType } from "./KanbanTopbar"
import { KanbanBoard } from "./KanbanBoard"

interface KanbanBoardShellProps {
  boardId: string
}

export function KanbanBoardShell({ boardId }: KanbanBoardShellProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const filters = useKanbanStore((state) => state.filters)
  const setFilters = useKanbanStore((state) => state.setFilters)
  const [activeView, setActiveView] = useState<ViewType>("board")

  if (!board) {
    return null
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <KanbanTopbar board={board} activeView={activeView} onViewChange={setActiveView} />
      <KanbanFiltersBar filters={filters} onFiltersChange={setFilters} />
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === "list" ? (
          <KanbanListView boardId={boardId} />
        ) : (
          <KanbanBoard boardId={boardId} />
        )}
      </div>
    </div>
  )
}

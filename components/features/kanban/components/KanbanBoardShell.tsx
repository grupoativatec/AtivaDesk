"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-screen w-full"
    >
      <KanbanTopbar board={board} activeView={activeView} onViewChange={setActiveView} />
      <KanbanFiltersBar filters={filters} onFiltersChange={setFilters} />
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === "list" ? (
          <KanbanListView boardId={boardId} />
        ) : (
          <KanbanBoard boardId={boardId} />
        )}
      </div>
    </motion.div>
  )
}

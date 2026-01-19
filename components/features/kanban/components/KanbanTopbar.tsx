"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { KanbanBoard } from "../types/kanban.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  ChevronDown,
  Plus,
  Share2,
  List,
  Columns3,
  FolderKanban,
} from "lucide-react"
import { CreateCardDialog } from "./CreateCardDialog"
import { CreateColumnDialog } from "./CreateColumnDialog"
import { cn } from "@/lib/utils"
import { useKanbanStore } from "../store/useKanbanStore"

interface KanbanTopbarProps {
  board: KanbanBoard
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export type ViewType = "list" | "board"

const VIEWS: Array<{ id: ViewType; label: string; icon: typeof List }> = [
  { id: "list", label: "Lista", icon: List },
  { id: "board", label: "Quadro", icon: Columns3 },
]

export function KanbanTopbar({ board, activeView, onViewChange }: KanbanTopbarProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreateColumnDialogOpen, setIsCreateColumnDialogOpen] = useState(false)
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const boardsRecord = useKanbanStore((state) => state.boards)
  const filters = useKanbanStore((state) => state.filters)
  const setFilters = useKanbanStore((state) => state.setFilters)

  // Memoiza a lista de boards para evitar recálculos
  const boards = useMemo(() => Object.values(boardsRecord), [boardsRecord])

  // Sincroniza busca com filtros
  useEffect(() => {
    setSearchQuery(filters.q || "")
  }, [filters.q])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setFilters({ ...filters, q: value || undefined })
  }


  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-sm">
        <div className="h-16 flex items-center px-6">
          {/* Bloco Esquerdo - Contexto do Board */}
          <div className="flex items-center gap-3 shrink-0 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0">
              <FolderKanban className="h-4 w-4" />
            </div>
            <Popover open={isBoardDropdownOpen} onOpenChange={setIsBoardDropdownOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-1.5 hover:bg-accent/50 rounded-md px-2 py-1 transition-colors group min-w-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsBoardDropdownOpen(!isBoardDropdownOpen)
                  }}
                >
                  <h1 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {board.name}
                  </h1>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-1"
                align="start"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-0.5">
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        router.push(`/admin/kanban/${b.id}`)
                        setIsBoardDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors text-left",
                        b.id === board.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <FolderKanban className="h-4 w-4" />
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Bloco Central - Tabs de Navegação */}
          <div className="flex items-center gap-1 mx-2 sm:mx-6 flex-1 justify-center overflow-x-auto">
            {VIEWS.map((view) => {
              const Icon = view.icon
              const isActive = activeView === view.id
              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors shrink-0",
                    isActive
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{view.label}</span>
                </button>
              )
            })}
          </div>

          {/* Bloco Direito - Busca, Avatares e Ações */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Campo de Busca */}
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-64 h-8 pl-8 text-sm bg-muted/50 border-border/50 focus-visible:bg-background"
              />
            </div>

            {/* Botão Nova Coluna */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateColumnDialogOpen(true)}
              className="h-8 rounded-full px-3 sm:px-4 hidden sm:flex"
            >
              <Columns3 className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Nova Coluna</span>
            </Button>

          </div>
        </div>
      </header>

      <CreateCardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        boardId={board.id}
      />

      <CreateColumnDialog
        open={isCreateColumnDialogOpen}
        onOpenChange={setIsCreateColumnDialogOpen}
        boardId={board.id}
      />
    </>
  )
}

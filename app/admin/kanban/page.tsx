"use client"

import { KanbanBoardListItem } from "@/components/features/kanban/types/kanban.types"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, FolderKanban } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchBoards } from "@/components/features/kanban/services/kanban.service"
import { CreateBoardDialog } from "@/components/features/kanban/components/CreateBoardDialog"
import { KanbanBoardCard } from "@/components/features/kanban/components/KanbanBoardCard"

export default function KanbanListPage() {
  const [boards, setBoards] = useState<KanbanBoardListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const loadBoards = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const boardsData = await fetchBoards()

      // Transforma para o formato de lista
      const listItems: KanbanBoardListItem[] = boardsData.map((board) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        projectId: board.projectId,
        projectName: board.projectName,
        cardCount: Object.keys(board.cards).length,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      }))

      setBoards(listItems)
    } catch (err: any) {
      console.error("Erro ao carregar boards:", err)
      setError(err.message || "Erro ao carregar boards")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBoards()
  }, [])

  return (
    <div className="flex flex-col h-full w-full">
      {/* Topbar fixa com blur */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <FolderKanban className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Kanban Boards</h1>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm shrink-0"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Novo Board</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <div className="container px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 sm:h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
              <p className="text-sm sm:text-base text-destructive mb-3 sm:mb-4">{error}</p>
              <Button onClick={loadBoards} size="sm" className="h-8 sm:h-9">
                Tentar novamente
              </Button>
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center px-4">
              <FolderKanban className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2">Nenhum board encontrado</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-4">
                Crie seu primeiro board para começar a organizar suas tarefas
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="h-8 sm:h-9"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Criar Board
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board) => (
                <KanbanBoardCard
                  key={board.id}
                  board={board}
                  onUpdate={loadBoards}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de criação */}
      <CreateBoardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadBoards}
      />
    </div>
  )
}

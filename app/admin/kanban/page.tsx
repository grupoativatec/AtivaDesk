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
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Kanban Boards</h1>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Board
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <div className="container px-6 py-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadBoards}>Tentar novamente</Button>
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum board encontrado</h2>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro board para começar a organizar suas tarefas
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Board
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

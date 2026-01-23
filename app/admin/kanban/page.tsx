"use client"

import { KanbanBoardListItem } from "@/components/features/kanban/types/kanban.types"
import { motion, AnimatePresence } from "framer-motion"
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

  const handleDeleteBoard = (boardId: string) => {
    setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardId))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col h-full"
    >
      {/* Header da página */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                  Kanban Boards
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-1">
                Organize e gerencie suas tarefas com boards visuais
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Novo Board</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6 lg:py-8">
          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 sm:h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
              <FolderKanban className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground">
                Erro ao carregar boards
              </h2>
              <p className="text-sm sm:text-base text-destructive mb-4 max-w-md">
                {error}
              </p>
              <Button onClick={loadBoards} size="sm" className="h-9">
                Tentar novamente
              </Button>
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FolderKanban className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground">
                Nenhum board encontrado
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-md">
                Crie seu primeiro board para começar a organizar suas tarefas de forma visual e eficiente
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                size="sm"
                className="h-9"
              >
                <Plus className="size-4 mr-2" />
                Criar Board
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {boards.map((board) => (
                  <KanbanBoardCard
                    key={board.id}
                    board={board}
                    onUpdate={loadBoards}
                    onDelete={handleDeleteBoard}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Modal de criação */}
      <CreateBoardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={loadBoards}
      />
    </motion.div>
  )
}

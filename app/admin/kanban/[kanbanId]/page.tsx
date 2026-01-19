"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useKanbanStore } from "@/components/features/kanban/store/useKanbanStore"
import { fetchBoard } from "@/components/features/kanban/services/kanban.service"
import { KanbanBoardShell } from "@/components/features/kanban/components/KanbanBoardShell"

export default function KanbanBoardPage() {
  const params = useParams()
  const router = useRouter()
  const kanbanId = params.kanbanId as string
  const { setBoard, setCurrentBoard, boards } = useKanbanStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!kanbanId) return

    // Se o board já está no store, não precisa recarregar
    if (boards[kanbanId]) {
      setCurrentBoard(kanbanId)
      setIsLoading(false)
      return
    }

    // Carrega o board do backend
    const loadBoard = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const board = await fetchBoard(kanbanId)
        setBoard(board)
        setCurrentBoard(kanbanId)
      } catch (err: any) {
        console.error("Erro ao carregar board:", err)
        setError(err.message || "Erro ao carregar board")
        // Redireciona para lista se não encontrado
        if (err.message?.includes("não encontrado") || err.message?.includes("404")) {
          router.push("/admin/kanban")
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadBoard()
  }, [kanbanId, setBoard, setCurrentBoard, router, boards])

  const board = boards[kanbanId]

  if (isLoading) {
    return null // Loading será mostrado pelo loading.tsx
  }

  if (error || !board) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive">{error || "Board não encontrado"}</p>
        </div>
      </div>
    )
  }

  return <KanbanBoardShell boardId={kanbanId} />
}

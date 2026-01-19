"use client"

import { useState, useMemo } from "react"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanEmptyState } from "./KanbanEmptyState"
import { KanbanCardEdit } from "./KanbanCardEdit"
import { KanbanCardMenu } from "./KanbanCardMenu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { filterCards } from "../utils/kanban-filters.utils"
import { KanbanStatus } from "../types/kanban.types"
import { Calendar, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface KanbanListViewProps {
  boardId: string
}

const STATUS_LABELS: Record<KanbanStatus, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Progresso",
  REVIEW: "Em Revisão",
  DONE: "Concluído",
}

const STATUS_COLORS: Record<KanbanStatus, string> = {
  TODO: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const PRIORITY_COLORS = {
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
}

export function KanbanListView({ boardId }: KanbanListViewProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const filters = useKanbanStore((state) => state.filters)
  const deleteCard = useKanbanStore((state) => state.deleteCard)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)

  const allCards = useMemo(() => {
    if (!board) return []

    // Coleta todos os cards de todas as colunas
    const cards: Array<{ card: typeof board.cards[string]; status: KanbanStatus }> = []
    
    board.columns.forEach((column) => {
      column.cardIds.forEach((cardId) => {
        const card = board.cards[cardId]
        if (card) {
          cards.push({ card, status: column.status })
        }
      })
    })

    return cards
  }, [board])

  const filteredCards = useMemo(() => {
    if (!board) return []
    
    return allCards
      .map(({ card }) => card)
      .filter((card) => filterCards([card], filters, board.id).length > 0)
  }, [allCards, filters, board])

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isOverdue = (dueDate?: string, status?: KanbanStatus) => {
    if (!dueDate || status === "DONE") return false
    return new Date(dueDate) < new Date()
  }

  if (!board) {
    return null
  }

  if (filteredCards.length === 0) {
    return (
      <div className="h-full p-4 sm:p-6">
        <KanbanEmptyState type="no-results" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-3">
        {/* Header da lista (oculto em mobile, visível em desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div className="col-span-4">Tarefa</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Prioridade</div>
          <div className="col-span-2">Prazo</div>
          <div className="col-span-2">Responsável</div>
        </div>

        {/* Lista de cards */}
        {filteredCards.map((card) => {
          const column = board.columns.find((col) => col.cardIds.includes(card.id))
          const status = column?.status || card.status
          const overdue = isOverdue(card.dueDate, status)

          if (editingCardId === card.id) {
            return (
              <div key={card.id} className="mb-3">
                <KanbanCardEdit
                  boardId={boardId}
                  card={card}
                  onCancel={() => setEditingCardId(null)}
                />
              </div>
            )
          }

          return (
            <div
              key={card.id}
              className={cn(
                "group relative rounded-lg border border-border/60 bg-card p-3 sm:p-4",
                "hover:shadow-md hover:border-border transition-all duration-200",
                "grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center"
              )}
            >
              {/* Menu de ações (aparece no hover) */}
              <div className="absolute top-2 right-2 z-10">
                <KanbanCardMenu
                  onEdit={() => setEditingCardId(card.id)}
                  onDelete={() => setDeletingCardId(card.id)}
                />
              </div>
              {/* Tarefa (mobile: full width, desktop: 4 colunas) */}
              <div className="md:col-span-4 space-y-1.5 min-w-0">
                <h4 className="font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h4>
                {card.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                )}
                {/* Tags (mobile) */}
                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 md:hidden">
                    {card.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                          index % 3 === 0 && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                          index % 3 === 1 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                          index % 3 === 2 && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        +{card.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status (mobile: inline, desktop: 2 colunas) */}
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">Status:</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    STATUS_COLORS[status]
                  )}
                >
                  {STATUS_LABELS[status]}
                </Badge>
              </div>

              {/* Prioridade (mobile: inline, desktop: 2 colunas) */}
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">Prioridade:</span>
                {card.priority ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      PRIORITY_COLORS[card.priority]
                    )}
                  >
                    {card.priority === "HIGH" ? "Alta" : card.priority === "MEDIUM" ? "Média" : "Baixa"}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Prazo (mobile: inline, desktop: 2 colunas) */}
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">Prazo:</span>
                {card.dueDate ? (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded",
                      overdue
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(card.dueDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Responsável (mobile: inline, desktop: 2 colunas) */}
              <div className="md:col-span-2 flex items-center gap-2">
                <span className="md:hidden text-xs font-medium text-muted-foreground">Responsável:</span>
                {card.assigneeName ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border shadow-sm">
                      <AvatarImage src={card.assigneeAvatar} alt={card.assigneeName} />
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                        {getInitials(card.assigneeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[100px]">
                      {card.assigneeName}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              {/* Tags (desktop) */}
              {card.tags && card.tags.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1.5 col-span-12 pt-2 border-t">
                  {card.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                        index % 3 === 0 && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        index % 3 === 1 && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        index % 3 === 2 && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dialog de confirmação de exclusão */}
      {deletingCardId && (
        <AlertDialog open={!!deletingCardId} onOpenChange={(open) => !open && setDeletingCardId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir card?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O card será permanentemente removido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCardId(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (deletingCardId) {
                    try {
                      await deleteCard(boardId, deletingCardId)
                      setDeletingCardId(null)
                    } catch (error) {
                      // Erro já foi tratado no store (rollback automático)
                      // Em produção, pode mostrar uma notificação de erro aqui
                      console.error("Erro ao deletar card:", error)
                    }
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

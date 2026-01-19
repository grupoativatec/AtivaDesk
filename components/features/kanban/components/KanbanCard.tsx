"use client"

import { useState } from "react"
import { KanbanCard as KanbanCardType } from "../types/kanban.types"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { KanbanCardEdit } from "./KanbanCardEdit"
import { KanbanCardMenu } from "./KanbanCardMenu"
import { useKanbanStore } from "../store/useKanbanStore"
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

interface KanbanCardProps {
  boardId: string
  card: KanbanCardType
}

export function KanbanCard({ boardId, card }: KanbanCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteCard = useKanbanStore((state) => state.deleteCard)

  const priorityColors = {
    HIGH: "bg-red-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-blue-500",
  }

  const isOverdue = card.dueDate
    ? new Date(card.dueDate) < new Date() && card.status !== "DONE"
    : false

  const handleDelete = async () => {
    setShowDeleteDialog(false)
    try {
      await deleteCard(boardId, card.id)
    } catch (error) {
      // Erro já foi tratado no store (rollback automático)
      // Em produção, pode mostrar uma notificação de erro aqui
      console.error("Erro ao deletar card:", error)
    }
  }

  // Gera iniciais do nome do assignee
  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Cores para tags (inspirado no Trello)
  const tagColors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  ]

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length]
  }

  if (isEditing) {
    return (
      <KanbanCardEdit
        boardId={boardId}
        card={card}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <>
      <div
        className={cn(
          "group relative cursor-pointer rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all duration-200",
          "hover:shadow-md hover:border-border hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-sm"
        )}
      >
        {/* Menu de ações (aparece no hover) */}
        <div className="absolute top-2 right-2 z-10">
          <KanbanCardMenu
            onEdit={() => setIsEditing(true)}
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>

        {/* Barra de prioridade no topo (estilo Trello) */}
        {card.priority && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
              priorityColors[card.priority as keyof typeof priorityColors]
            )}
          />
        )}

        {/* Conteúdo do card */}
        <div className={cn("space-y-2.5", card.priority && "pt-1")}>
          {/* Título */}
          <h4 className="font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors pr-6">
            {card.title}
          </h4>

          {/* Descrição */}
          {card.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {card.description}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {card.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                    getTagColor(index)
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

          {/* Footer com metadados */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Data de vencimento */}
              {card.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
                    isOverdue
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
              )}
            </div>

            {/* Avatar do assignee */}
            {card.assigneeName && (
              <div className="flex items-center gap-1.5 shrink-0">
                <Avatar className="h-6 w-6 border-2 border-background shadow-sm">
                  <AvatarImage src={card.assigneeAvatar} alt={card.assigneeName} />
                  <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                    {getInitials(card.assigneeName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir card?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O card "{card.title}" será
              permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

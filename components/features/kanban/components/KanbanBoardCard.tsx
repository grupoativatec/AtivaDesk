"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FolderKanban, Calendar, Pencil, Trash2, Link2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { KanbanBoardListItem } from "../types/kanban.types"
import { persistUpdateBoard, persistDeleteBoard } from "../services/kanban.service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface KanbanBoardCardProps {
  board: KanbanBoardListItem
  onUpdate: () => void
}

export function KanbanBoardCard({ board, onUpdate }: KanbanBoardCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(board.name)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingConfirm, setIsDeletingConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleEdit = () => {
    setEditedName(board.name)
    setIsEditing(true)
    setIsPopoverOpen(false)
  }

  const handleSave = async () => {
    if (!editedName.trim()) {
      toast.error("Nome não pode estar vazio")
      return
    }

    if (editedName.trim() === board.name) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      await persistUpdateBoard({
        boardId: board.id,
        updates: {
          name: editedName.trim(),
        },
      })
      toast.success("Board atualizado com sucesso")
      setIsEditing(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar board")
      setEditedName(board.name)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedName(board.name)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await persistDeleteBoard({ boardId: board.id })
      toast.success("Board excluído com sucesso")
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir board")
    } finally {
      setIsDeleting(false)
      setIsDeletingConfirm(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "group relative rounded-lg border bg-card p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-md",
          board.projectId && "border-primary/20 bg-primary/5"
        )}
      >


        {/* Menu de ações */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 w-7 sm:w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 sm:w-48 p-1.5 sm:p-2" align="end">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
                >
                  <Pencil className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive h-8 sm:h-9 text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPopoverOpen(false)
                    setIsDeletingConfirm(true)
                  }}
                >
                  <Trash2 className="mr-1.5 sm:mr-2 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                  Excluir
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Conteúdo do card */}
        <div
          onClick={() => router.push(`/admin/kanban/${board.id}`)}
          className="cursor-pointer"
        >
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className={cn(
              "p-1.5 sm:p-2 rounded-lg shrink-0",
              board.projectId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSave()
                      } else if (e.key === "Escape") {
                        handleCancel()
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={handleSave}
                    autoFocus
                    disabled={isSaving}
                    className="h-7 sm:h-8 text-xs sm:text-sm"
                  />
                </div>
              ) : (
                <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1">
                  {board.name}
                </h3>
              )}
            </div>
          </div>

          {board.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
              {board.description}
            </p>
          )}

          {board.projectName && (
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-primary bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md">
                <Link2 className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                <span className="line-clamp-1">{board.projectName}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-3 sm:pt-4 border-t">
            <div className="flex items-center gap-1">
              <span className="font-medium">{board.cardCount}</span>
              <span>cards</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              <span className="line-clamp-1">
                {new Date(board.updatedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeletingConfirm} onOpenChange={setIsDeletingConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Board</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o board "{board.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

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
          "group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md",
          board.projectId && "border-primary/20 bg-primary/5"
        )}
      >


        {/* Menu de ações */}
        <div className="absolute top-3 right-3">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPopoverOpen(false)
                    setIsDeletingConfirm(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "p-2 rounded-lg",
              board.projectId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
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
                    className="h-8"
                  />
                </div>
              ) : (
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {board.name}
                </h3>
              )}
            </div>
          </div>

          {board.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {board.description}
            </p>
          )}

          {board.projectName && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                <Link2 className="h-3 w-3" />
                <span>{board.projectName}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <span className="font-medium">{board.cardCount}</span>
              <span>cards</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
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

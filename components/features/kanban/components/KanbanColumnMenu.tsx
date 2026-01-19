"use client"

import { useState } from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useKanbanStore } from "../store/useKanbanStore"
import { toast } from "sonner"

interface KanbanColumnMenuProps {
  boardId: string
  columnId: string
  columnTitle: string
}

export function KanbanColumnMenu({
  boardId,
  columnId,
  columnTitle,
}: KanbanColumnMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(columnTitle)
  const updateColumn = useKanbanStore((state) => state.updateColumn)
  const deleteColumn = useKanbanStore((state) => state.deleteColumn)
  const board = useKanbanStore((state) => state.boards[boardId])
  const column = board?.columns.find((col) => col.id === columnId)

  const handleEdit = async () => {
    if (!newTitle.trim()) {
      toast.error("Título não pode estar vazio")
      return
    }

    if (newTitle.trim() === columnTitle) {
      setIsEditDialogOpen(false)
      return
    }

    try {
      await updateColumn(boardId, columnId, { title: newTitle.trim() })
      toast.success("Coluna renomeada com sucesso")
      setIsEditDialogOpen(false)
    } catch (error) {
      toast.error("Erro ao renomear coluna")
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!column) return

    // Verifica se há cards na coluna
    if (column.cardIds.length > 0) {
      toast.error("Não é possível excluir uma coluna que contém cards")
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      await deleteColumn(boardId, columnId)
      toast.success("Coluna excluída com sucesso")
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao excluir coluna"
      toast.error(errorMessage)
      console.error(error)
    }
  }

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
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
              onClick={() => {
                setIsPopoverOpen(false)
                setIsEditDialogOpen(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Renomear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => {
                setIsPopoverOpen(false)
                setIsDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Coluna</DialogTitle>
            <DialogDescription>
              Digite o novo nome para a coluna
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nome da coluna"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEdit()
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setNewTitle(columnTitle)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coluna</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a coluna "{columnTitle}"?
              {column && column.cardIds.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Esta coluna contém {column.cardIds.length} card(s). Você precisa mover ou excluir os cards antes de excluir a coluna.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={column && column.cardIds.length > 0}
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

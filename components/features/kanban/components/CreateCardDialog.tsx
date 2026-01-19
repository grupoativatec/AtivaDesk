"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKanbanStore } from "../store/useKanbanStore"
import { createCardSchema, CreateCardFormData } from "../schemas/card.schema"
import { KanbanStatus } from "../types/kanban.types"
import { nanoid } from "nanoid"
import { KanbanTagsInput } from "./KanbanTagsInput"
import { User } from "lucide-react"

interface CreateCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  defaultColumnId?: string
  defaultColumnStatus?: KanbanStatus
}

export function CreateCardDialog({
  open,
  onOpenChange,
  boardId,
  defaultColumnId,
  defaultColumnStatus = "TODO",
}: CreateCardDialogProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const addCard = useKanbanStore((state) => state.addCard)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState(
    defaultColumnId || board?.columns[0]?.id || ""
  )

  // Mock de usuários disponíveis (será substituído por dados reais)
  const availableUsers = [
    { id: "user-1", name: "João Silva", email: "joao@example.com", avatar: undefined },
    { id: "user-2", name: "Maria Santos", email: "maria@example.com", avatar: undefined },
    { id: "user-3", name: "Pedro Costa", email: "pedro@example.com", avatar: undefined },
    { id: "user-4", name: "Ana Oliveira", email: "ana@example.com", avatar: undefined },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateCardFormData>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      priority: undefined,
      dueDate: undefined,
      projectId: board?.projectId,
      assigneeId: undefined,
      assigneeName: undefined,
      tags: [],
    },
  })

  const selectedPriority = watch("priority")
  const selectedDueDate = watch("dueDate")
  const selectedAssigneeId = watch("assigneeId")
  const selectedTags = watch("tags") || []

  const onSubmit = async (data: CreateCardFormData) => {
    if (!selectedColumnId) return

    setIsLoading(true)

    const column = board?.columns.find((col) => col.id === selectedColumnId)
    if (!column) {
      setIsLoading(false)
      return
    }

    const selectedUser = availableUsers.find((u) => u.id === data.assigneeId)

    try {
      const newCard = {
        id: `card-${nanoid()}`,
        title: data.title,
        description: data.description,
        status: column.status,
        order: 0, // Decorativo
        priority: data.priority,
        dueDate: data.dueDate,
        projectId: data.projectId || board?.projectId,
        projectName: data.projectId ? board?.projectName : undefined,
        assigneeId: data.assigneeId,
        assigneeName: selectedUser?.name,
        assigneeAvatar: selectedUser?.avatar,
        tags: data.tags && data.tags.length > 0 ? data.tags : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await addCard(boardId, newCard, selectedColumnId)

      reset()
      setIsLoading(false)
      onOpenChange(false)
    } catch (error) {
      // Erro já foi tratado no store (rollback automático)
      setIsLoading(false)
      // Em produção, pode mostrar uma notificação de erro aqui
      console.error("Erro ao criar card:", error)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Card</DialogTitle>
          <DialogDescription>
            Preencha os dados do card. O título é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Coluna */}
          <div className="space-y-2">
            <Label htmlFor="column">Coluna</Label>
            <Select
              value={selectedColumnId}
              onValueChange={setSelectedColumnId}
            >
              <SelectTrigger id="column">
                <SelectValue placeholder="Selecione a coluna" />
              </SelectTrigger>
              <SelectContent>
                {board?.columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Implementar autenticação"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o card..."
              rows={3}
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={selectedPriority || "all"}
              onValueChange={(value) =>
                setValue("priority", value === "all" ? undefined : value as "LOW" | "MEDIUM" | "HIGH")
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nenhuma</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prazo */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Prazo</Label>
            <Input
              id="dueDate"
              type="date"
              {...register("dueDate")}
              value={selectedDueDate || ""}
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Responsável</Label>
            <Select
              value={selectedAssigneeId || "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setValue("assigneeId", undefined)
                  setValue("assigneeName", undefined)
                } else {
                  const user = availableUsers.find((u) => u.id === value)
                  setValue("assigneeId", value)
                  setValue("assigneeName", user?.name)
                }
              }}
            >
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <KanbanTagsInput
              tags={selectedTags}
              onChange={(newTags) => setValue("tags", newTags)}
              placeholder="Digite e pressione Enter para adicionar..."
            />
          </div>

          {/* Projeto (se board vinculado) */}
          {board?.projectId && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Vincular ao Projeto</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkProject"
                  checked={watch("projectId") === board.projectId}
                  onChange={(e) =>
                    setValue(
                      "projectId",
                      e.target.checked ? board.projectId : undefined
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="linkProject" className="font-normal cursor-pointer">
                  {board.projectName || "Vincular ao projeto do board"}
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

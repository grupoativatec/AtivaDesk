"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanStatus } from "../types/kanban.types"
import { nanoid } from "nanoid"
import { toast } from "sonner"

// Schema base - status é sempre opcional no formulário, mas será obrigatório no backend quando há projeto
const createColumnSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
})

type CreateColumnFormData = z.infer<typeof createColumnSchema>

interface CreateColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
}

const STATUS_OPTIONS: Array<{ value: KanbanStatus; label: string }> = [
  { value: "TODO", label: "A Fazer" },
  { value: "IN_PROGRESS", label: "Em Progresso" },
  { value: "REVIEW", label: "Em Revisão" },
  { value: "DONE", label: "Concluído" },
]

export function CreateColumnDialog({
  open,
  onOpenChange,
  boardId,
}: CreateColumnDialogProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const addColumn = useKanbanStore((state) => state.addColumn)
  const [isLoading, setIsLoading] = useState(false)

  // Verifica se o board tem projeto vinculado
  const hasProject = !!board?.projectId

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateColumnFormData>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: {
      status: hasProject ? "TODO" : undefined,
    },
  })

  const selectedStatus = watch("status")

  const onSubmit = async (data: CreateColumnFormData) => {
    setIsLoading(true)

    try {
      // Calcula a ordem máxima e adiciona 1
      const maxOrder = board?.columns.length
        ? Math.max(...board.columns.map((col) => col.order))
        : -1

      // Se há projeto, status é obrigatório
      if (hasProject && !data.status) {
        throw new Error("Status é obrigatório quando o board está vinculado a um projeto")
      }

      const newColumn = {
        id: `column-${nanoid()}`,
        title: data.title,
        // Se não há projeto, usa "TODO" como padrão (não será usado para sincronização)
        // Se há projeto, usa o status selecionado (obrigatório)
        status: (data.status || "TODO") as KanbanStatus,
        order: maxOrder + 1,
        cardIds: [],
      }

      await addColumn(boardId, newColumn)

      reset()
      setIsLoading(false)
      onOpenChange(false)
    } catch (error: any) {
      // Erro já foi tratado no store (rollback automático)
      setIsLoading(false)
      console.error("Erro ao criar coluna:", error)
      toast.error(error.message || "Erro ao criar coluna")
    }
  }

  const handleClose = () => {
    reset({
      title: "",
      status: hasProject ? "TODO" : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Coluna</DialogTitle>
          <DialogDescription>
            Adicione uma nova coluna ao quadro. O título é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Em Análise"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Status - apenas quando há projeto vinculado */}
          {hasProject && (
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedStatus || "TODO"}
                onValueChange={(value) =>
                  setValue("status", value as KanbanStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
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
              {isLoading ? "Criando..." : "Criar Coluna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

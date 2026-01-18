"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProjectSchema, type UpdateProjectFormData } from "./project.schema"
import { updateProject } from "@/lib/api/projects"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { TaskUnit, ProjectStatus, ProjectListItem } from "./project.types"

interface EditProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectListItem | null
  onSuccess?: () => void
}

export function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
  })

  const selectedUnit = watch("unit")
  const selectedStatus = watch("status")

  // Carregar dados do projeto quando modal abre
  useEffect(() => {
    if (open && project) {
      reset({
        name: project.name,
        code: project.code || "",
        unit: project.unit || undefined,
        status: project.status,
      })
    }
  }, [open, project, reset])

  // Reset form quando modal fecha
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: UpdateProjectFormData) => {
    if (!project) return

    setIsSubmitting(true)
    try {
      await updateProject(project.id, {
        name: data.name,
        code: data.code || undefined,
        unit: data.unit,
        status: data.status,
      })

      toast.success("Projeto atualizado com sucesso!")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao atualizar projeto:", error)
      toast.error(error.message || "Erro ao atualizar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Evitar hydration mismatch: só renderizar quando montado no cliente
  if (!mounted || !project) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>
            Atualize os dados do projeto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Ex: Sistema de Gestão"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code">Código (opcional)</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="Ex: PROJ-ITJ"
              disabled={isSubmitting}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select
                value={selectedUnit || "none"}
                onValueChange={(value) =>
                  setValue("unit", value === "none" ? undefined : (value as TaskUnit))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="ITJ">ITJ</SelectItem>
                  <SelectItem value="SFS">SFS</SelectItem>
                  <SelectItem value="FOZ">FOZ</SelectItem>
                  <SelectItem value="DIO">DIO</SelectItem>
                  <SelectItem value="AOL">AOL</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as ProjectStatus)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


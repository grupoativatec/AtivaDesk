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
import { createProjectSchema, type CreateProjectFormData } from "./project.schema"
import { createProject } from "@/lib/api/projects"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { TaskUnit, ProjectStatus } from "./project.types"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      code: "",
      status: "ACTIVE" as const,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form

  const selectedUnit = watch("unit")
  const selectedStatus = watch("status")

  // Reset form quando modal fecha
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: CreateProjectFormData) => {
    setIsSubmitting(true)
    try {
      await createProject({
        name: data.name,
        code: data.code || undefined,
        unit: data.unit,
        status: data.status,
      })

      toast.success("Projeto criado com sucesso!")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error)
      toast.error(error.message || "Erro ao criar projeto")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Evitar hydration mismatch: só renderizar quando montado no cliente
  if (!mounted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo projeto
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
              Criar Projeto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


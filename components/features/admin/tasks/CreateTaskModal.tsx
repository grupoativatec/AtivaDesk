"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import { TaskPriority, TaskStatus, TaskUnit } from "./task.types"
import { createTask } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { TaskAssigneesMultiSelect } from "./TaskAssigneesMultiSelect"
import { listProjects } from "@/lib/api/projects"
import { listAdmins } from "@/lib/api/users"

const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  projectId: z.string().min(1, "Projeto é obrigatório"),
  unit: z.nativeEnum(TaskUnit),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.BACKLOG),
  assigneeIds: z.array(z.string()).default([]),
  estimatedHours: z.number().int().min(0).default(0),
  description: z.string().optional(),
})

type CreateTaskFormData = z.input<typeof createTaskSchema>
type CreateTaskPayload = z.output<typeof createTaskSchema>

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
  onSuccess?: () => void
}

export function CreateTaskModal({
  open,
  onOpenChange,
  defaultProjectId,
  onSuccess,
}: CreateTaskModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([])

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
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      projectId: defaultProjectId || "",
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      unit: TaskUnit.ITJ,
      assigneeIds: [],
      estimatedHours: 0,
    },
  })

  // Atualizar projectId quando defaultProjectId mudar
  useEffect(() => {
    if (defaultProjectId && open) {
      setValue("projectId", defaultProjectId)
    }
  }, [defaultProjectId, open, setValue])

  const selectedProjectId = watch("projectId")
  const selectedUnit = watch("unit")
  const selectedPriority = watch("priority")
  const selectedStatus = watch("status")
  const selectedAssigneeIds = watch("assigneeIds")

  // Carregar projetos e assignees do banco de dados
  useEffect(() => {
    if (open) {
      async function loadData() {
        try {
          const [projectsRes, adminsData] = await Promise.all([
            listProjects({ status: "ACTIVE", page: 1, pageSize: 200 }),
            listAdmins(),
          ])
          
          const projectsData = Array.isArray(projectsRes) ? projectsRes : projectsRes.projects
          
          setProjects(
            (projectsData || [])
              .filter((p) => p.status === "ACTIVE")
              .map((p) => ({ id: p.id, name: p.name }))
          )
          
          // Transformar admins para o formato esperado (Assignee)
          setAssignees(
            adminsData.map((admin) => ({ id: admin.id, name: admin.name }))
          )
        } catch (error) {
          console.error("Erro ao carregar projetos/usuários:", error)
          toast.error("Erro ao carregar dados. Tente novamente.")
        }
      }

      loadData()
    }
  }, [open])

  // Reset form quando modal fecha
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true)
    try {
      const response = await createTask({
        title: data.title,
        projectId: data.projectId,
        unit: data.unit,
        priority: data.priority,
        status: data.status,
        assigneeIds: data.assigneeIds,
        estimatedHours: data.estimatedHours,
        description: data.description,
      })

      toast.success("Tarefa criada com sucesso!")
      onOpenChange(false)
      
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirecionar para o detalhe da tarefa apenas se não houver callback
        router.push(`/admin/tarefas/${response.task.id}`)
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      toast.error("Erro ao criar tarefa")
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova tarefa
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
              placeholder="Ex: Implementar integração X"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Projeto */}
          <div className="space-y-2">
            <Label htmlFor="projectId">
              Projeto <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={(value) => setValue("projectId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-destructive">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit">
                Unidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedUnit}
                onValueChange={(value) =>
                  setValue("unit", value as TaskUnit)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskUnit.ITJ}>ITJ</SelectItem>
                  <SelectItem value={TaskUnit.SFS}>SFS</SelectItem>
                  <SelectItem value={TaskUnit.FOZ}>FOZ</SelectItem>
                  <SelectItem value={TaskUnit.DIO}>DIO</SelectItem>
                  <SelectItem value={TaskUnit.AOL}>AOL</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Prioridade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) =>
                  setValue("priority", value as TaskPriority)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Baixa</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Média</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>Alta</SelectItem>
                  <SelectItem value={TaskPriority.URGENT}>Urgente</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as TaskStatus)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                  <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    Em Progresso
                  </SelectItem>
                  <SelectItem value={TaskStatus.BLOCKED}>Bloqueada</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Horas Estimadas */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Horas Estimadas</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="1"
                {...register("estimatedHours", { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-destructive">
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Responsáveis */}
          <div className="space-y-2">
            <Label htmlFor="assignees">Responsáveis</Label>
            <TaskAssigneesMultiSelect
              assignees={
                (selectedAssigneeIds || [])
                  .map((id) => (assignees || []).find((a) => a.id === id))
                  .filter((a): a is { id: string; name: string } => a !== undefined)
              }
              availableAssignees={assignees || []}
              onChange={(selectedAssignees) => {
                setValue(
                  "assigneeIds",
                  selectedAssignees.map((a) => a.id),
                  { shouldValidate: true }
                )
              }}
              disabled={isSubmitting}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição detalhada da tarefa (opcional)"
              rows={4}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
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
              Criar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

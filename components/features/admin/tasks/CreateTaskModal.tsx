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
  projectId: z.string().optional(),
  unit: z.nativeEnum(TaskUnit),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.BACKLOG),
  assigneeIds: z.array(z.string()).default([]),
  teamId: z.string().optional().nullable(), // Equipe responsável
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
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])

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
      projectId: defaultProjectId || undefined,
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
  const selectedTeamId = watch("teamId")

  // Carregar projetos, assignees e equipes do banco de dados
  useEffect(() => {
    if (open) {
      async function loadData() {
        try {
          const [projectsRes, adminsData, teamsRes] = await Promise.all([
            listProjects({ status: "ACTIVE", page: 1, pageSize: 200 }),
            listAdmins(),
            fetch("/api/admin/teams").then((res) => res.json()).then((data) => data.teams || []).catch(() => []),
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

          // Transformar equipes
          setTeams(
            (teamsRes || []).map((team: any) => ({ id: team.id, name: team.name }))
          )
        } catch (error) {
          console.error("Erro ao carregar projetos/usuários/equipes:", error)
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
        projectId: data.projectId || undefined,
        unit: data.unit,
        priority: data.priority,
        status: data.status,
        assigneeIds: data.assigneeIds,
        teamId: data.teamId || undefined,
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1.5 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Nova Tarefa</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Preencha os dados para criar uma nova tarefa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          {/* Título */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm font-medium">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Implementar integração X"
              disabled={isSubmitting}
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
            {errors.title && (
              <p className="text-xs sm:text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Projeto */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="projectId" className="text-xs sm:text-sm font-medium">Projeto</Label>
            <Select
              value={selectedProjectId || "none"}
              onValueChange={(value) => setValue("projectId", value === "none" ? undefined : value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="projectId" className="h-9 sm:h-10 text-sm sm:text-base">
                <SelectValue placeholder="Selecione um projeto (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Unidade */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="unit" className="text-xs sm:text-sm font-medium">
                Unidade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedUnit}
                onValueChange={(value) =>
                  setValue("unit", value as TaskUnit)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="unit" className="h-9 sm:h-10 text-sm sm:text-base">
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
                <p className="text-xs sm:text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>

            {/* Prioridade */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="priority" className="text-xs sm:text-sm font-medium">
                Prioridade <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) =>
                  setValue("priority", value as TaskPriority)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="priority" className="h-9 sm:h-10 text-sm sm:text-base">
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
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Status */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="status" className="text-xs sm:text-sm font-medium">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setValue("status", value as TaskStatus)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="status" className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                  <SelectItem value={TaskStatus.TODO}>A Fazer</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    Em Progresso
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Horas Estimadas */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="estimatedHours" className="text-xs sm:text-sm font-medium">Horas Estimadas</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="1"
                {...register("estimatedHours", { valueAsNumber: true })}
                disabled={isSubmitting}
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
              {errors.estimatedHours && (
                <p className="text-xs sm:text-sm text-destructive">
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Equipe */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="teamId" className="text-xs sm:text-sm font-medium">Equipe Responsável</Label>
            {mounted ? (
              <Select
                value={selectedTeamId || "none"}
                onValueChange={(value) => {
                  setValue("teamId", value === "none" ? undefined : value, { shouldValidate: true })
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="teamId" className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue placeholder="Selecione uma equipe (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma equipe</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-9 sm:h-10 rounded-md border bg-background px-3 py-2 text-xs sm:text-sm flex items-center text-muted-foreground">
                Carregando...
              </div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              Ao selecionar uma equipe, todos os membros serão automaticamente atribuídos como responsáveis.
            </p>
          </div>

          {/* Responsáveis */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="assignees" className="text-xs sm:text-sm font-medium">Responsáveis Individuais</Label>
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
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              Você pode adicionar responsáveis individuais além da equipe selecionada.
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm font-medium">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição detalhada da tarefa (opcional)"
              rows={3}
              className="text-sm sm:text-base resize-none"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs sm:text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base order-1 sm:order-2"
            >
              {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
              Criar Tarefa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { TaskListItem, TaskStatus, TaskPriority, TaskUnit, Project, Assignee } from "./task.types"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"
import { TaskEditableField } from "./TaskEditableField"
import { TaskAssigneesMultiSelect } from "./TaskAssigneesMultiSelect"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    FolderOpen,
    Building2,
    Users,
    Clock,
    Calendar,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { TaskEditData } from "./task.edit.schema"
import { statusLabelMap } from "./TaskStatusBadge"
import { priorityLabelMap } from "./TaskPriorityBadge"
import { listProjects, listAdmins } from "@/lib/api"
import { toast } from "sonner"

interface TaskDetailsSidebarProps {
    task: TaskListItem
    isEditing?: boolean
    draft?: Partial<TaskEditData>
    onDraftChange?: (updates: Partial<TaskEditData>) => void
}

const UNIT_LABELS: Record<TaskUnit, string> = {
    ITJ: "ITJ",
    SFS: "SFS",
    FOZ: "FOZ",
    DIO: "DIO",
    AOL: "AOL",
}

export function TaskDetailsSidebar({
    task,
    isEditing = false,
    draft,
    onDraftChange,
}: TaskDetailsSidebarProps) {
    const updatedDate = new Date(task.updatedAt)
    const isOverEstimated = task.loggedHours > task.estimatedHours
    const hoursPercentage = task.estimatedHours > 0
        ? Math.round((task.loggedHours / task.estimatedHours) * 100)
        : 0

    // Estados para projetos e assignees do banco de dados
    const [projects, setProjects] = useState<Project[]>([])
    const [availableAssignees, setAvailableAssignees] = useState<Assignee[]>([])
    const [isLoadingData, setIsLoadingData] = useState(false)

    // Carregar projetos e assignees quando entrar em modo de edição
    useEffect(() => {
        if (isEditing) {
            async function loadData() {
                setIsLoadingData(true)
                try {
                    const [projectsResponse, adminsData] = await Promise.all([
                        listProjects(),
                        listAdmins(),
                    ])

                    // Transformar projetos para o formato esperado
                    setProjects(
                        (projectsResponse.projects || [])
                            .filter((p) => p.status === "ACTIVE")
                            .map((p) => ({ id: p.id, name: p.name }))
                    )

                    // Transformar admins para o formato esperado (Assignee)
                    setAvailableAssignees(
                        adminsData.map((admin) => ({ id: admin.id, name: admin.name }))
                    )
                } catch (error) {
                    console.error("Erro ao carregar projetos/usuários:", error)
                    toast.error("Erro ao carregar dados. Tente novamente.")
                } finally {
                    setIsLoadingData(false)
                }
            }

            loadData()
        }
    }, [isEditing])

    // Usar draft se estiver editando, senão usar task
    const displayTask = isEditing && draft
        ? {
            ...task,
            project: draft.project ?? task.project,
            unit: draft.unit ?? task.unit,
            status: draft.status ?? task.status,
            priority: draft.priority ?? task.priority,
            assignees: draft.assignees ?? task.assignees,
            estimatedHours: draft.estimatedHours ?? task.estimatedHours,
        }
        : task

    const handleProjectChange = (projectId: string) => {
        const project = projects.find((p) => p.id === projectId)
        if (onDraftChange) {
            onDraftChange({ project: project || null })
        }
    }

    const handleUnitChange = (unit: TaskUnit) => {
        if (onDraftChange) {
            onDraftChange({ unit })
        }
    }

    const handleStatusChange = (status: TaskStatus) => {
        if (onDraftChange) {
            onDraftChange({ status })
        }
    }

    const handlePriorityChange = (priority: TaskPriority) => {
        if (onDraftChange) {
            onDraftChange({ priority })
        }
    }

    const handleAssigneesChange = (assignees: Assignee[]) => {
        if (onDraftChange) {
            onDraftChange({ assignees })
        }
    }

    const handleEstimatedHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10)
        if (!isNaN(value) && onDraftChange) {
            onDraftChange({ estimatedHours: value })
        }
    }

    return (
        <div className="w-full lg:w-80 shrink-0">
            <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm dark:shadow-none">
                <h2 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">Informações</h2>

                <div className="space-y-3 sm:space-y-4">
                    {/* Projeto */}
                    <TaskEditableField
                        label="Projeto"
                        icon={FolderOpen}
                        isEditing={isEditing}
                        displayContent={
                            <p className="text-sm text-foreground font-medium">
                                {displayTask.project?.name || "Sem projeto"}
                            </p>
                        }
                        editContent={
                            <Select
                                value={displayTask.project?.id || "none"}
                                onValueChange={(value) => {
                                    if (value === "none") {
                                        if (onDraftChange) {
                                            onDraftChange({ project: null })
                                        }
                                    } else {
                                        handleProjectChange(value)
                                    }
                                }}
                                disabled={isLoadingData}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isLoadingData ? "Carregando..." : "Selecione um projeto (opcional)"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sem projeto</SelectItem>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                    />

                    <Separator />

                    {/* Unidade */}
                    <TaskEditableField
                        label="Unidade"
                        icon={Building2}
                        isEditing={isEditing}
                        displayContent={
                            <p className="text-sm text-foreground font-medium">
                                {displayTask.unit}
                            </p>
                        }
                        editContent={
                            <Select
                                value={displayTask.unit}
                                onValueChange={handleUnitChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(UNIT_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                    />

                    <Separator />

                    {/* Status */}
                    <TaskEditableField
                        label="Status"
                        isEditing={isEditing}
                        displayContent={<TaskStatusBadge status={displayTask.status} />}
                        editContent={
                            <Select
                                value={displayTask.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statusLabelMap).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                    />

                    <Separator />

                    {/* Prioridade */}
                    <TaskEditableField
                        label="Prioridade"
                        isEditing={isEditing}
                        displayContent={<TaskPriorityBadge priority={displayTask.priority} />}
                        editContent={
                            <Select
                                value={displayTask.priority}
                                onValueChange={handlePriorityChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(priorityLabelMap).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                    />

                    <Separator />

                    {/* Responsáveis */}
                    <TaskEditableField
                        label="Responsáveis"
                        icon={Users}
                        isEditing={isEditing}
                        displayContent={
                            <div className="space-y-1.5">
                                {displayTask.assignees.length > 0 ? (
                                    displayTask.assignees.map((assignee) => (
                                        <div key={assignee.id} className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                                                {assignee.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </div>
                                            <span className="text-sm text-foreground">{assignee.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">
                                        Não definido
                                    </span>
                                )}
                            </div>
                        }
                        editContent={
                            <TaskAssigneesMultiSelect
                                assignees={displayTask.assignees}
                                availableAssignees={availableAssignees}
                                onChange={handleAssigneesChange}
                                disabled={isLoadingData}
                            />
                        }
                    />

                    <Separator />

                    {/* Horas */}
                    <TaskEditableField
                        label="Horas"
                        icon={Clock}
                        isEditing={isEditing}
                        displayContent={
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estimado:</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {displayTask.estimatedHours}h
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Real:</span>
                                    <span
                                        className={cn(
                                            "text-sm font-semibold",
                                            isOverEstimated ? "text-destructive" : "text-foreground"
                                        )}
                                    >
                                        {task.loggedHours}h
                                    </span>
                                </div>

                                {/* Barra de progresso */}
                                <div className="mt-2">
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all",
                                                isOverEstimated
                                                    ? "bg-destructive"
                                                    : hoursPercentage <= 50
                                                        ? "bg-primary"
                                                        : hoursPercentage <= 80
                                                            ? "bg-yellow-500 dark:bg-yellow-600"
                                                            : "bg-orange-500 dark:bg-orange-600"
                                            )}
                                            style={{ width: `${Math.min(hoursPercentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-muted-foreground">
                                            {hoursPercentage}%
                                        </span>
                                        {isOverEstimated && (
                                            <div className="flex items-center gap-1 text-xs text-destructive">
                                                <AlertTriangle className="size-3" />
                                                <span>Acima do estimado</span>
                                            </div>
                                        )}
                                        {!isOverEstimated && hoursPercentage <= 50 && (
                                            <div className="flex items-center gap-1 text-xs text-primary">
                                                <CheckCircle2 className="size-3" />
                                                <span>No prazo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                        editContent={
                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">
                                        Horas estimadas
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="500"
                                        step="1"
                                        value={displayTask.estimatedHours}
                                        onChange={handleEstimatedHoursChange}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-sm text-muted-foreground">Real:</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {task.loggedHours}h
                                    </span>
                                </div>
                            </div>
                        }
                    />

                    <Separator />

                    {/* Última atualização */}
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Última atualização
                            </span>
                        </div>
                        <p className="text-sm text-foreground pl-6">
                            {format(updatedDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                locale: ptBR,
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

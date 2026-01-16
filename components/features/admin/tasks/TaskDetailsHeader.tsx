"use client"

import { TaskListItem } from "./task.types"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Clock, AlertTriangle, Users, FolderOpen, Calendar, Save, X, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface TaskDetailsHeaderProps {
    task: TaskListItem
    isEditing?: boolean
    hasUnsavedChanges?: boolean
    isSaving?: boolean
    onEdit?: () => void
    onCancel?: () => void
    onSave?: () => void
}

export function TaskDetailsHeader({
    task,
    isEditing = false,
    hasUnsavedChanges = false,
    isSaving = false,
    onEdit,
    onCancel,
    onSave,
}: TaskDetailsHeaderProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const returnTo = searchParams.get("returnTo")

    const taskIdFormatted = task.id.toUpperCase()
    const updatedDate = new Date(task.updatedAt)
    const timeAgo = formatDistanceToNow(updatedDate, {
        addSuffix: true,
        locale: ptBR,
    })

    const isOverEstimated = task.loggedHours > task.estimatedHours

    const handleBack = () => {
        if (returnTo) {
            router.push(returnTo)
        } else {
            router.push("/admin/tarefas")
        }
    }

    return (
        <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5">
                {/* Breadcrumb e ações */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="h-8 w-8 p-0 -ml-2"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Admin / Tarefas / {taskIdFormatted}
                        </span>
                        {isEditing && hasUnsavedChanges && (
                            <span className="text-xs text-orange-600 dark:text-orange-500 font-medium">
                                • Alterações não salvas
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onCancel}
                                    disabled={isSaving}
                                    className="text-xs"
                                >
                                    <X className="size-3.5 mr-1.5" />
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onSave}
                                    disabled={isSaving || !hasUnsavedChanges}
                                    className="text-xs"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-3.5 mr-1.5" />
                                            Salvar
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEdit}
                                className="text-xs"
                            >
                                <Edit className="size-3.5 mr-1.5" />
                                Editar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Título e badges */}
                <div className="space-y-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                            {taskIdFormatted} — {task.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-2">
                            <TaskStatusBadge status={task.status} />
                            <TaskPriorityBadge priority={task.priority} />
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                {task.unit}
                            </span>
                        </div>
                    </div>

                    {/* Metadados rápidos */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1.5">
                            <FolderOpen className="size-4" />
                            <span className="font-medium text-foreground">Projeto:</span>
                            <span>{task.project.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            <span className="font-medium text-foreground">Responsáveis:</span>
                            <div className="flex items-center gap-1.5">
                                {task.assignees.length > 0 ? (
                                    task.assignees.map((assignee, idx) => (
                                        <span key={assignee.id} className="text-xs bg-muted px-2 py-0.5 rounded">
                                            {assignee.name.split(" ")[0]}
                                            {idx < task.assignees.length - 1 && ","}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs italic">Não definido</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Clock className="size-4" />
                            <span className="font-medium text-foreground">Horas:</span>
                            <span className={cn(
                                "font-semibold",
                                isOverEstimated && "text-orange-600 dark:text-orange-500"
                            )}>
                                {task.loggedHours}h lançadas
                            </span>
                            <span className="text-muted-foreground">/</span>
                            <span>{task.estimatedHours}h estimadas</span>
                            {isOverEstimated && (
                                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-500">
                                    <AlertTriangle className="size-3.5" />
                                    <span className="text-xs font-medium">Acima do estimado</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            <span className="text-xs text-muted-foreground">
                                Atualizado {timeAgo}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

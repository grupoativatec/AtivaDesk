"use client"

import { TaskListItem } from "./task.types"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

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

    // Mostrar apenas as 5 primeiras letras do UUID (sem hífens)
    const taskIdFormatted = task.id.replace(/-/g, "").substring(0, 5).toUpperCase()

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
                            Admin / Tarefas
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
                </div>
            </div>
        </div>
    )
}

"use client"

import { TaskListItem } from "./task.types"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save, X, Loader2, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface TaskDetailsHeaderProps {
    task: TaskListItem
    isEditing?: boolean
    hasUnsavedChanges?: boolean
    isSaving?: boolean
    onEdit?: () => void
    onCancel?: () => void
    onSave?: () => void
    onDelete?: () => void
    isDeleting?: boolean
}

export function TaskDetailsHeader({
    task,
    isEditing = false,
    hasUnsavedChanges = false,
    isSaving = false,
    onEdit,
    onCancel,
    onSave,
    onDelete,
    isDeleting = false,
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
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5">
                {/* Mobile: Layout compacto */}
                <div className="md:hidden space-y-2.5">
                    {/* Linha 1: Voltar, Título e ações */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="h-8 w-8 p-0 -ml-1 shrink-0"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                            <h1 className="text-base font-bold text-foreground line-clamp-1 truncate">
                                {taskIdFormatted} — {task.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onCancel}
                                        disabled={isSaving || isDeleting}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onSave}
                                        disabled={isSaving || !hasUnsavedChanges || isDeleting}
                                        className="h-8 px-3"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Save className="size-4" />
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onEdit}
                                        disabled={isDeleting}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit className="size-4" />
                                    </Button>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="size-4" />
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Linha 2: Badges e aviso */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {isEditing && hasUnsavedChanges && (
                            <span className="text-[10px] text-orange-600 dark:text-orange-500 font-medium">
                                Alterações não salvas
                            </span>
                        )}
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {task.unit}
                        </span>
                    </div>
                </div>

                {/* Desktop: Layout completo */}
                <div className="hidden md:block">
                    {/* Linha 1: Voltar, Título e ações */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="h-8 w-8 p-0 -ml-2 shrink-0"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
                                {taskIdFormatted} — {task.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onCancel}
                                        disabled={isSaving || isDeleting}
                                        className="text-xs"
                                    >
                                        <X className="size-3.5 mr-1.5" />
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onSave}
                                        disabled={isSaving || !hasUnsavedChanges || isDeleting}
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
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onEdit}
                                        disabled={isDeleting}
                                        className="text-xs"
                                    >
                                        <Edit className="size-3.5 mr-1.5" />
                                        Editar
                                    </Button>
                                    {onDelete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onDelete}
                                            disabled={isDeleting}
                                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                                                    Excluindo...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="size-3.5 mr-1.5" />
                                                    Excluir
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Linha 2: Breadcrumb, badges e aviso */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                            Admin / Tarefas
                        </span>
                        {isEditing && hasUnsavedChanges && (
                            <span className="text-xs text-orange-600 dark:text-orange-500 font-medium">
                                • Alterações não salvas
                            </span>
                        )}
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {task.unit}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

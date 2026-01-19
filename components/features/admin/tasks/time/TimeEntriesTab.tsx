"use client"

import { useState, useEffect, useMemo } from "react"
import { TimeEntry } from "./time-entry.types"
import { TimeEntriesTable } from "./TimeEntriesTable"
import { TimeEntryModal } from "./TimeEntryModal"
import { getTotalHoursFromEntries } from "./time-entries.utils"
import { TimeEntryFormData } from "./time-entry.schema"
import { listTimeEntries, createTimeEntry, deleteTimeEntry } from "@/lib/api/timeEntries"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Clock, Plus } from "lucide-react"
import { toast } from "sonner"
import { TaskStatus } from "../task.types"

interface TimeEntriesTabProps {
    taskId: string
    taskStatus?: TaskStatus // Para bloquear apontamentos em tarefas DONE
    onTaskReload?: () => void // Callback para recarregar task após mudanças
}

export function TimeEntriesTab({ taskId, taskStatus, onTaskReload }: TimeEntriesTabProps) {
    const [entries, setEntries] = useState<TimeEntry[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const isTaskDone = taskStatus === "DONE"

    // Carregar entries do backend
    const loadEntries = async () => {
        try {
            const loadedEntries = await listTimeEntries(taskId)
            setEntries(loadedEntries)
        } catch (error) {
            console.error("Erro ao carregar apontamentos:", error)
            toast.error("Erro ao carregar apontamentos")
        }
    }

    // Carregar entries ao montar componente
    useEffect(() => {
        loadEntries()
    }, [taskId])

    // Calcular total a partir de entries (useMemo) - usando função helper
    const totalHours = useMemo(() => {
        return getTotalHoursFromEntries(entries)
    }, [entries])

    // Handler que recebe os dados já validados do modal
    const handleAddEntry = async (formData: TimeEntryFormData) => {
        try {
            // Chamar API real
            await createTimeEntry(taskId, {
                date: formData.date,
                hours: formData.hours,
                type: formData.type,
                note: formData.note,
            })

            // Recarregar entries
            await loadEntries()

            // Recarregar task para atualizar loggedHours
            if (onTaskReload) {
                onTaskReload()
            }

            toast.success("Apontamento registrado com sucesso")
            setModalOpen(false)
        } catch (error: any) {
            console.error("Erro ao adicionar apontamento:", error)
            const errorMessage = error?.message || "Erro ao adicionar apontamento"
            toast.error(errorMessage)
        }
    }

    const handleDeleteClick = (entryId: string) => {
        const entry = entries.find((e) => e.id === entryId)
        if (entry) {
            setEntryToDelete(entry)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!entryToDelete) return

        setIsDeleting(true)
        try {
            // Chamar API real
            await deleteTimeEntry(taskId, entryToDelete.id)

            // Recarregar entries
            await loadEntries()

            // Recarregar task para atualizar loggedHours
            if (onTaskReload) {
                onTaskReload()
            }

            toast.success("Apontamento excluído com sucesso")
            setEntryToDelete(null)
        } catch (error: any) {
            console.error("Erro ao excluir apontamento:", error)
            const errorMessage = error?.message || "Erro ao excluir apontamento"
            toast.error(errorMessage)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Resumo e botão */}
            <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 sm:p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="size-8 sm:size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                            <Clock className="size-4 sm:size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Total lançado</h3>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">{totalHours}h</p>
                        </div>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setModalOpen(true)}
                                size="sm"
                                disabled={isTaskDone}
                                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm shrink-0"
                            >
                                <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Apontar horas</span>
                                <span className="sm:hidden">Apontar</span>
                            </Button>
                        </TooltipTrigger>
                        {isTaskDone && (
                            <TooltipContent>
                                <p>Tarefa concluída — não é possível lançar horas</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </div>
            </div>

            {/* Lista ou empty state */}
            {entries.length === 0 ? (
                <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-6 sm:p-8 md:p-12 shadow-sm dark:shadow-none">
                    <div className="text-center">
                        <div className="size-12 sm:size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Clock className="size-6 sm:size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                            Nenhum apontamento registrado
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-4">
                            Comece registrando horas trabalhadas nesta tarefa
                        </p>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => setModalOpen(true)}
                                    disabled={isTaskDone}
                                >
                                    <Plus className="size-4 mr-2" />
                                    Apontar horas
                                </Button>
                            </TooltipTrigger>
                            {isTaskDone && (
                                <TooltipContent>
                                    <p>Tarefa concluída — não é possível lançar horas</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </div>
                </div>
            ) : (
                <TimeEntriesTable
                    entries={entries}
                    onDelete={handleDeleteClick}
                    entryToDelete={entryToDelete}
                    isDeleting={isDeleting}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={() => setEntryToDelete(null)}
                />
            )}

            {/* Modal */}
            <TimeEntryModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                taskId={taskId}
                onSuccess={handleAddEntry}
            />
        </div>
    )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskActivityEvent } from "./task-activity.types"
import { listTaskActivity } from "@/lib/api/activity"
import { TaskActivityTimeline } from "./TaskActivityTimeline"
import { TaskActivityEmptyState } from "./TaskActivityEmptyState"
import { Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface TaskActivityTabProps {
    taskId: string
}

export function TaskActivityTab({ taskId }: TaskActivityTabProps) {
    const [events, setEvents] = useState<TaskActivityEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const loadEvents = useCallback(async () => {
        setIsLoading(true)
        try {
            const loadedEvents = await listTaskActivity(taskId)
            setEvents(loadedEvents)
        } catch (error) {
            console.error("Erro ao carregar atividade:", error)
            toast.error("Erro ao carregar atividade")
        } finally {
            setIsLoading(false)
        }
    }, [taskId])

    // Carregar eventos ao montar componente ou quando taskId mudar
    useEffect(() => {
        loadEvents()
    }, [taskId, loadEvents])

    return (
        <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            <Activity className="size-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Atividade</h3>
                            <p className="text-2xl font-bold text-foreground">{events.length}</p>
                        </div>
                    </div>
                    {events.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {events.length} {events.length === 1 ? "evento" : "eventos"}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Timeline ou empty state */}
            {isLoading ? (
                <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-12 shadow-sm dark:shadow-none">
                    <div className="text-center">
                        <Activity className="size-8 text-muted-foreground mx-auto mb-4 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Carregando atividade...</p>
                    </div>
                </div>
            ) : events.length === 0 ? (
                <TaskActivityEmptyState />
            ) : (
                <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-6 shadow-sm dark:shadow-none">
                    <TaskActivityTimeline events={events} />
                </div>
            )}
        </div>
    )
}

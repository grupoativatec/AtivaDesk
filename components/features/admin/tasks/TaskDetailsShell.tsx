"use client"

import { useState, useEffect } from "react"
import { TaskListItem } from "./task.types"
import { TaskDetailsOverview } from "./TaskDetailsOverview"
import { TaskDetailsSidebar } from "./TaskDetailsSidebar"
import { TimeEntriesTab } from "./time/TimeEntriesTab"
import { TaskActivityTab } from "./activity/TaskActivityTab"
import { Clock, Activity, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskEditData } from "./task.edit.schema"

interface TaskDetailsShellProps {
    task: TaskListItem
    isEditing?: boolean
    draft?: Partial<TaskEditData>
    onDraftChange?: (updates: Partial<TaskEditData>) => void
    onTaskReload?: () => void
}

type TabId = "overview" | "time" | "activity"

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "overview", label: "Resumo", icon: FileText },
    { id: "time", label: "Apontamentos", icon: Clock },
    { id: "activity", label: "Atividade", icon: Activity },
]

export function TaskDetailsShell({
    task,
    isEditing = false,
    draft,
    onDraftChange,
    onTaskReload,
}: TaskDetailsShellProps) {
    const [activeTab, setActiveTab] = useState<TabId>("overview")
    const [activityReloadKey, setActivityReloadKey] = useState(0)
    const description = task.description || "Nenhuma descrição fornecida."
    const acceptance = task.acceptance || null

    const handleAcceptanceChange = (newAcceptance: string | null) => {
        if (onDraftChange) {
            onDraftChange({ acceptance: newAcceptance })
        }
    }

    // Função para recarregar atividade (chamada após mudanças)
    const reloadActivity = () => {
        setActivityReloadKey((prev) => prev + 1)
    }

    // Recarregar atividade quando necessário
    useEffect(() => {
        if (activeTab === "activity") {
            // Recarregar ao abrir a aba ou quando task é atualizada
            reloadActivity()
        }
    }, [activeTab, task.updatedAt, isEditing])

    return (
        <div className="flex-1 overflow-auto bg-muted/20 dark:bg-background/50">
            <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Layout duas colunas em desktop, uma coluna em mobile */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* Conteúdo principal */}
                        <div className="flex-1 min-w-0">
                            {/* Tabs */}
                            <div className="border-b border-border dark:border-border/30 mb-4">
                                <div className="flex items-center gap-1 overflow-x-auto">
                                    {TABS.map((tab) => {
                                        const Icon = tab.icon
                                        const isActive = activeTab === tab.id

                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                                                    isActive
                                                        ? "border-primary text-primary"
                                                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                                )}
                                            >
                                                {Icon && <Icon className="size-4" />}
                                                {tab.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Conteúdo das tabs */}
                            <div className="min-h-[400px]">
                                {activeTab === "overview" && (
                                    <TaskDetailsOverview 
                                        description={description}
                                        acceptance={acceptance}
                                        isEditing={isEditing}
                                        onAcceptanceChange={handleAcceptanceChange}
                                    />
                                )}

                                {activeTab === "time" && (
                                    <TimeEntriesTab
                                        taskId={task.id}
                                        taskStatus={task.status}
                                        onTaskReload={onTaskReload}
                                    />
                                )}

                                {activeTab === "activity" && (
                                    <TaskActivityTab
                                        taskId={task.id}
                                        key={activityReloadKey}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:order-last">
                            <TaskDetailsSidebar
                                task={task}
                                isEditing={isEditing}
                                draft={draft}
                                onDraftChange={onDraftChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { TaskListItem } from "@/components/features/admin/tasks/task.types"
import { TaskStatusBadge } from "@/components/features/admin/tasks/TaskStatusBadge"
import { TaskPriorityBadge } from "@/components/features/admin/tasks/TaskPriorityBadge"
import { ProjectTasksFilters, getStatusFilterFromTab, type TaskFilterTab } from "./ProjectTasksFilters"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, ListTodo } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { listTasks } from "@/lib/api/tasks"
import { toast } from "sonner"

interface ProjectTasksPanelProps {
  projectId: string
  onCreateTask: () => void
}

export function ProjectTasksPanel({ projectId, onCreateTask }: ProjectTasksPanelProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TaskFilterTab>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Carregar tarefas
  useEffect(() => {
    let cancelled = false

    async function loadTasks() {
      setLoading(true)
      try {
        const statusFilter = getStatusFilterFromTab(activeTab)
        
        // Para tabs com múltiplos status, buscar todas e filtrar no cliente
        // Para tabs com um único status, usar filtro na API
        const response = await listTasks({
          project: projectId,
          status: statusFilter && statusFilter.length === 1 ? statusFilter[0] : undefined,
          q: searchQuery || undefined,
          pageSize: 100, // Carregar todas as tarefas do projeto
        })

        // Filtrar por status se necessário (para tabs que precisam de múltiplos status)
        let filteredTasks = response.tasks
        if (statusFilter && statusFilter.length > 0) {
          filteredTasks = response.tasks.filter((task) =>
            statusFilter.includes(task.status)
          )
        }

        if (!cancelled) {
          setTasks(filteredTasks)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar tarefas:", error)
          const message = error instanceof Error ? error.message : "Erro ao carregar tarefas"
          toast.error(message)
          setTasks([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [projectId, activeTab, searchQuery])

  const handleTaskClick = (taskId: string) => {
    const returnTo = `/admin/projetos/${projectId}`
    router.push(`/admin/tarefas/${taskId}?returnTo=${encodeURIComponent(returnTo)}`)
  }

  return (
    <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
      <div className="p-3 sm:p-4 md:p-6">
        {/* Mobile: Header mais compacto */}
        <div className="md:hidden mb-3">
          <h2 className="text-base font-semibold text-foreground mb-3">Tarefas</h2>
          <ProjectTasksFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Desktop: Header completo */}
        <div className="hidden md:block mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Tarefas</h2>
            <Button variant="outline" size="sm" onClick={onCreateTask}>
              <Plus className="size-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
          <ProjectTasksFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {loading ? (
          <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            <Skeleton className="h-14 sm:h-16 w-full" />
            <Skeleton className="h-14 sm:h-16 w-full" />
            <Skeleton className="h-14 sm:h-16 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center mt-3 sm:mt-4">
            <div className="size-10 sm:size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <ListTodo className="size-5 sm:size-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">
              {searchQuery ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa neste projeto"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 px-4">
              {searchQuery
                ? "Tente ajustar a busca"
                : "Comece criando a primeira tarefa do projeto"}
            </p>
            <Button variant="default" size="sm" onClick={onCreateTask}>
              <Plus className="size-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </div>
        ) : (
          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            {tasks.map((task) => {
              const updatedDate = new Date(task.updatedAt)
              const timeAgo = formatDistanceToNow(updatedDate, {
                addSuffix: true,
                locale: ptBR,
              })

              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className={cn(
                    "p-2.5 sm:p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 dark:hover:bg-muted/10 cursor-pointer transition-all",
                    "flex items-start gap-2 sm:gap-3"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Mobile: Layout vertical compacto */}
                    <div className="md:hidden space-y-1.5">
                      <div className="flex items-start gap-2">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 flex-1">
                          {task.title}
                        </h3>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                        {task.assignees.length > 0 && (
                          <>
                            <span className="line-clamp-1">
                              {task.assignees.map((a) => a.name.split(" ")[0]).join(", ")}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{timeAgo}</span>
                      </div>
                    </div>

                    {/* Desktop: Layout horizontal */}
                    <div className="hidden md:flex md:flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm text-foreground line-clamp-1">
                          {task.title}
                        </h3>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {task.assignees.length > 0 && (
                          <span>
                            {task.assignees.map((a) => a.name.split(" ")[0]).join(", ")}
                          </span>
                        )}
                        {task.assignees.length > 0 && <span>•</span>}
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


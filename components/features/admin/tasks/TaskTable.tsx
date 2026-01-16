"use client"

import { TaskListItem } from "./task.types"
import { TaskStatusBadge } from "./TaskStatusBadge"
import { TaskPriorityBadge } from "./TaskPriorityBadge"
import { Badge } from "@/components/ui/badge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Clock, Users, AlertTriangle } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface TaskTableProps {
  tasks: TaskListItem[]
  onTaskClick?: (taskId: string) => void
}

export function TaskTable({ tasks, onTaskClick }: TaskTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleRowClick = (taskId: string) => {
    if (onTaskClick) {
      onTaskClick(taskId)
    } else {
      // Preservar filtros ao navegar para detalhes
      const currentQuery = searchParams.toString()
      const returnTo = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname
      router.push(`/admin/tarefas/${taskId}?returnTo=${encodeURIComponent(returnTo)}`)
    }
  }

  return (
    <>
      {/* Tabela Desktop */}
      <div className="hidden lg:block">
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 dark:bg-muted/10 border-b border-border dark:border-border/30">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tarefa
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Responsáveis
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Atualizado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border/20">
                {tasks.map((task) => {
                  const updatedDate = new Date(task.updatedAt)
                  const timeAgo = formatDistanceToNow(updatedDate, {
                    addSuffix: true,
                    locale: ptBR,
                  })
                  const isOverEstimated = task.loggedHours > task.estimatedHours
                  const hoursPercentage =
                    task.estimatedHours > 0
                      ? Math.round((task.loggedHours / task.estimatedHours) * 100)
                      : 0

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(task.id)}
                    >
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm text-foreground">
                            {task.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {task.project.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground font-medium">
                          {task.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="p-4">
                        <TaskPriorityBadge priority={task.priority} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="size-3.5 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {task.assignees.length > 0 ? (
                              task.assignees.map((assignee, idx) => (
                                <span
                                  key={assignee.id}
                                  className="text-xs text-foreground bg-muted px-2 py-0.5 rounded"
                                >
                                  {assignee.name.split(" ")[0]}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Não definido
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-medium",
                                isOverEstimated ? "text-destructive" : "text-foreground"
                              )}
                            >
                              {task.loggedHours}h / {task.estimatedHours}h
                            </span>
                            {isOverEstimated && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                              >
                                <AlertTriangle className="size-3 mr-1" />
                                Estourado
                              </Badge>
                            )}
                            {task.estimatedHours > 0 && !isOverEstimated && (
                              <span className="text-xs text-muted-foreground">
                                ({hoursPercentage}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <div className="flex flex-col">
                            <span>{format(updatedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                            <span className="text-xs">{timeAgo}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="lg:hidden space-y-4">
        {tasks.map((task) => {
          const updatedDate = new Date(task.updatedAt)
          const timeAgo = formatDistanceToNow(updatedDate, {
            addSuffix: true,
            locale: ptBR,
          })
          const isOverEstimated = task.loggedHours > task.estimatedHours
          const hoursPercentage =
            task.estimatedHours > 0
              ? Math.round((task.loggedHours / task.estimatedHours) * 100)
              : 0

          return (
            <div
              key={task.id}
              className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none cursor-pointer hover:shadow-md dark:hover:shadow-none transition-all"
              onClick={() => handleRowClick(task.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {task.project.name} • {task.unit}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0 ml-2">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="size-3.5" />
                  <span>
                    {task.assignees.length > 0
                      ? task.assignees.map((a) => a.name.split(" ")[0]).join(", ")
                      : "Não definido"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Clock className="size-3.5" />
                  <span
                    className={cn(
                      "font-medium",
                      isOverEstimated ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {task.loggedHours}h / {task.estimatedHours}h
                  </span>
                  {isOverEstimated && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-destructive/10 text-destructive border-destructive/20"
                    >
                      <AlertTriangle className="size-3 mr-1" />
                      Estourado
                    </Badge>
                  )}
                  {task.estimatedHours > 0 && !isOverEstimated && (
                    <span className="text-xs text-muted-foreground">
                      ({hoursPercentage}%)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5" />
                  <span>
                    {format(updatedDate, "dd/MM/yyyy", { locale: ptBR })} • {timeAgo}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Ticket, CheckSquare, ArrowRight } from "lucide-react"
import { TaskStatusBadge } from "@/components/features/admin/tasks/TaskStatusBadge"
import { TaskPriorityBadge } from "@/components/features/admin/tasks/TaskPriorityBadge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface MyWorkSectionProps {
  tickets: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
    openedBy: {
      id: string
      name: string
    }
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    updatedAt: string
    project: {
      id: string
      name: string
    }
    assignees: Array<{
      id: string
      name: string
    }>
  }>
  loading?: boolean
}

const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
}

const TICKET_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const TICKET_PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30",
  URGENT: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
}

export function MyWorkSection({ tickets, tasks, loading }: MyWorkSectionProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 lg:grid-cols-2">
      {/* Tickets Atribuídos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
              <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="line-clamp-1">Tickets Atribuídos</span>
          </CardTitle>
          {tickets.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/tickets")}
              className="h-7 sm:h-8 gap-1 text-[10px] sm:text-xs shrink-0"
            >
              <span className="hidden sm:inline">Ver todos</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="mb-2 sm:mb-3 rounded-full bg-muted p-2 sm:p-3">
                <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Nenhum ticket atribuído
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={cn(
                    "group rounded-lg border p-2.5 sm:p-3 md:p-4 transition-all duration-200",
                    "cursor-pointer hover:border-primary/50 hover:bg-accent/50",
                    "active:scale-[0.98]"
                  )}
                  onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2.5">
                    <h4 className="flex-1 text-xs sm:text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {ticket.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5",
                        TICKET_PRIORITY_COLORS[ticket.priority] || ""
                      )}
                    >
                      {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                    <span className="rounded-md bg-muted px-1.5 sm:px-2 py-0.5 font-medium">
                      {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
                    </span>
                    <span>•</span>
                    <span className="line-clamp-1">
                      {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarefas Atribuídas */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-500">
              <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="line-clamp-1">Tarefas Atribuídas</span>
          </CardTitle>
          {tasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/tarefas")}
              className="h-7 sm:h-8 gap-1 text-[10px] sm:text-xs shrink-0"
            >
              <span className="hidden sm:inline">Ver todas</span>
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="mb-2 sm:mb-3 rounded-full bg-muted p-2 sm:p-3">
                <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Nenhuma tarefa atribuída
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "group rounded-lg border p-2.5 sm:p-3 md:p-4 transition-all duration-200",
                    "cursor-pointer hover:border-primary/50 hover:bg-accent/50",
                    "active:scale-[0.98]"
                  )}
                  onClick={() => router.push(`/admin/tarefas/${task.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2.5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium leading-snug line-clamp-1 mb-0.5 sm:mb-1 group-hover:text-primary transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {task.project.name}
                      </p>
                    </div>
                    <TaskPriorityBadge priority={task.priority as any} />
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <TaskStatusBadge status={task.status as any} />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(task.updatedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

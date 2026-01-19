"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Kanban, ArrowRight } from "lucide-react"
import { TaskPriorityBadge } from "@/components/features/admin/tasks/TaskPriorityBadge"
import { cn } from "@/lib/utils"

interface KanbanSummaryProps {
  columns: {
    todo: {
      count: number
      cards: Array<{
        id: string
        title: string
        priority: string
        assignee?: {
          id: string
          name: string
        } | null
        boardId: string
        boardName: string
        project?: {
          id: string
          name: string
        } | null
      }>
    }
    inProgress: {
      count: number
      cards: Array<{
        id: string
        title: string
        priority: string
        assignee?: {
          id: string
          name: string
        } | null
        boardId: string
        boardName: string
        project?: {
          id: string
          name: string
        } | null
      }>
    }
    blocked: {
      count: number
      cards: Array<{
        id: string
        title: string
        priority: string
        assignee?: {
          id: string
          name: string
        } | null
        boardId: string
        boardName: string
        project?: {
          id: string
          name: string
        } | null
      }>
    }
  }
  loading?: boolean
}

export function KanbanSummary({ columns, loading }: KanbanSummaryProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-20" />
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const columnConfigs = [
    {
      key: "todo" as const,
      title: "A Fazer",
      color: "border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/10",
    },
    {
      key: "inProgress" as const,
      title: "Em Progresso",
      color: "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10",
    },
    {
      key: "blocked" as const,
      title: "Bloqueado",
      color: "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10",
    },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-500">
            <Kanban className="h-4 w-4" />
          </div>
          Kanban Resumido
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/kanban")}
          className="h-8 gap-1.5 text-xs"
        >
          Ver Completo
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {columnConfigs.map((config) => {
            const column = columns[config.key]
            return (
              <div
                key={config.key}
                className={cn(
                  "rounded-lg border p-3",
                  config.color
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{config.title}</h3>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {column.count}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {column.cards.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Nenhum card
                    </p>
                  ) : (
                    column.cards.map((card) => (
                      <div
                        key={card.id}
                        className={cn(
                          "group rounded-lg border bg-background p-2.5",
                          "cursor-pointer transition-all duration-200",
                          "hover:border-primary/50 hover:shadow-sm",
                          "active:scale-[0.98]"
                        )}
                        onClick={() => router.push(`/admin/kanban/${card.boardId}`)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="flex-1 text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                            {card.title}
                          </h4>
                          {card.priority && (
                            <TaskPriorityBadge priority={card.priority as any} />
                          )}
                        </div>
                        {card.project && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {card.project.name}
                          </p>
                        )}
                        {card.assignee && (
                          <p className="text-xs text-muted-foreground truncate">
                            {card.assignee.name}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

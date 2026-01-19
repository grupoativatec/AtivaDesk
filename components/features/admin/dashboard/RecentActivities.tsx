"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Ticket, CheckSquare, FolderArchive, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RecentActivitiesProps {
  activities: Array<{
    id: string
    type: string
    title: string
    description: string
    actor?: {
      id: string
      name: string
    }
    entity: {
      type: string
      id: string
      project?: {
        id: string
        name: string
      }
    }
    createdAt: string
    meta?: any
  }>
  loading?: boolean
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TICKET_CREATED: Ticket,
  TASK_COMPLETED: CheckSquare,
  PROJECT_ARCHIVED: FolderArchive,
  TASK_STATUS_CHANGED: Activity,
}

const ACTIVITY_COLORS: Record<string, string> = {
  TICKET_CREATED: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  TASK_COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
  PROJECT_ARCHIVED: "bg-gray-500/10 text-gray-600 dark:text-gray-500",
  TASK_STATUS_CHANGED: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
}

export function RecentActivities({ activities, loading }: RecentActivitiesProps) {
  const router = useRouter()

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleActivityClick = (activity: RecentActivitiesProps["activities"][0]) => {
    if (activity.entity.type === "ticket") {
      router.push(`/admin/tickets/${activity.entity.id}`)
    } else if (activity.entity.type === "task") {
      router.push(`/admin/tarefas/${activity.entity.id}`)
    } else if (activity.entity.type === "project") {
      router.push(`/admin/projetos/${activity.entity.id}`)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-500">
            <Activity className="h-4 w-4" />
          </div>
          Atividades Recentes
        </CardTitle>
        {activities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              // Pode navegar para uma página de atividades completas no futuro
            }}
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma atividade recente
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const Icon = ACTIVITY_ICONS[activity.type] || Activity
              const iconColor = ACTIVITY_COLORS[activity.type] || "bg-gray-500/10 text-gray-600"

              return (
                <div key={activity.id}>
                  <div
                    className={cn(
                      "group flex gap-4 p-4 transition-colors",
                      "cursor-pointer hover:bg-accent/50",
                      "active:scale-[0.98]"
                    )}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className={cn("p-2 rounded-lg shrink-0", iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {activity.description}
                      </p>
                      {activity.actor && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(activity.actor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.actor.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator />}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

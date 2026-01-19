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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base font-semibold">
          <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-500">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <span className="line-clamp-1">Atividades Recentes</span>
        </CardTitle>
        {activities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 sm:h-8 gap-1 text-[10px] sm:text-xs shrink-0"
            onClick={() => {
              // Pode navegar para uma página de atividades completas no futuro
            }}
          >
            <span className="hidden sm:inline">Ver todas</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="mb-2 sm:mb-3 rounded-full bg-muted p-2 sm:p-3">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
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
                      "group flex gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-3 md:p-4 transition-colors",
                      "cursor-pointer hover:bg-accent/50",
                      "active:scale-[0.98]"
                    )}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", iconColor)}>
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-1.5">
                        <h4 className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                          {activity.title}
                        </h4>
                        <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 ml-1">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 mb-1.5 sm:mb-2">
                        {activity.description}
                      </p>
                      {activity.actor && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                            <AvatarFallback className="text-[10px] sm:text-xs bg-primary/10 text-primary">
                              {getInitials(activity.actor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
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

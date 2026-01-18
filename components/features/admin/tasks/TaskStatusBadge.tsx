import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TaskStatus } from "./task.types"
import { Loader2, AlertCircle, CheckCircle2, Ban, Circle } from "lucide-react"

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string
    color: string
    icon?: React.ComponentType<{ className?: string }>
  }
> = {
  BACKLOG: {
    label: "Backlog",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/10 dark:text-gray-400/60 dark:border-gray-900/20",
    icon: Circle,
  },
  TODO: {
    label: "A Fazer",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/10 dark:text-blue-500/60 dark:border-blue-900/20",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/10 dark:text-yellow-500/60 dark:border-yellow-900/20",
    icon: Loader2,
  },
  BLOCKED: {
    label: "Bloqueada",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/10 dark:text-red-500/60 dark:border-red-900/20",
    icon: Ban,
  },
  DONE: {
    label: "Concluída",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/10 dark:text-green-500/60 dark:border-green-900/20",
    icon: CheckCircle2,
  },
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-2.5 py-1 flex items-center gap-1.5",
        config.color,
        className
      )}
    >
      {Icon && <Icon className="size-3" />}
      {config.label}
    </Badge>
  )
}

export const statusLabelMap: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  BLOCKED: "Bloqueada",
  DONE: "Concluída",
}

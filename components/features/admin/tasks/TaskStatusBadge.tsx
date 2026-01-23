import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TaskStatus } from "./task.types"
import { Loader2, AlertCircle, CheckCircle2, Circle } from "lucide-react"

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string
    color: string
    icon?: React.ComponentType<{ className?: string }>
  }
> = {
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
  TODO: "A Fazer",
  IN_PROGRESS: "Em Andamento",
  DONE: "Concluída",
}

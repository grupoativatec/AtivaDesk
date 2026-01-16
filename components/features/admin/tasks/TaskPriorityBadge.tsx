import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TaskPriority } from "./task.types"

const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string
    color: string
    order: number
  }
> = {
  LOW: {
    label: "Baixa",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/10 dark:text-blue-500/60 dark:border-blue-900/20",
    order: 1,
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/10 dark:text-yellow-500/60 dark:border-yellow-900/20",
    order: 2,
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/10 dark:text-orange-500/60 dark:border-orange-900/20",
    order: 3,
  },
  URGENT: {
    label: "Urgente",
    color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/10 dark:text-red-500/60 dark:border-red-900/20",
    order: 4,
  },
}

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2.5 py-1", config.color, className)}
    >
      {config.label}
    </Badge>
  )
}

export const priorityLabelMap: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

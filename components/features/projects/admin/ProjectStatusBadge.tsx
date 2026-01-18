import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProjectStatus } from "./project.types"
import { CheckCircle2, Archive } from "lucide-react"

const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string
    color: string
    icon?: React.ComponentType<{ className?: string }>
  }
> = {
  ACTIVE: {
    label: "Ativo",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/10 dark:text-green-500/60 dark:border-green-900/20",
    icon: CheckCircle2,
  },
  ARCHIVED: {
    label: "Arquivado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/10 dark:text-gray-400/60 dark:border-gray-900/20",
    icon: Archive,
  },
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
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

export const statusLabelMap: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  ARCHIVED: "Arquivado",
}


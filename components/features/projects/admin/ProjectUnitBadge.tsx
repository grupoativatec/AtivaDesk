import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TaskUnit } from "./project.types"
import { UNIT_LABELS } from "./project.constants"

interface ProjectUnitBadgeProps {
  unit: TaskUnit
  className?: string
}

export function ProjectUnitBadge({ unit, className }: ProjectUnitBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium px-2.5 py-1 bg-muted text-muted-foreground",
        className
      )}
    >
      {UNIT_LABELS[unit]}
    </Badge>
  )
}


"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TaskEditableFieldProps {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  isEditing: boolean
  displayContent: ReactNode
  editContent: ReactNode
  className?: string
}

export function TaskEditableField({
  label,
  icon: Icon,
  isEditing,
  displayContent,
  editContent,
  className,
}: TaskEditableFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={cn("pl-6", isEditing && "space-y-2")}>
        {isEditing ? editContent : displayContent}
      </div>
    </div>
  )
}

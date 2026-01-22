"use client"

import { useState } from "react"
import { Assignee } from "./task.types"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskAssigneesMultiSelectProps {
  assignees?: Assignee[]
  availableAssignees?: Assignee[]
  onChange: (assignees: Assignee[]) => void
  disabled?: boolean
}

export function TaskAssigneesMultiSelect({
  assignees = [],
  availableAssignees = [],
  onChange,
  disabled,
}: TaskAssigneesMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggleAssignee = (assignee: Assignee) => {
    const isSelected = assignees.some((a) => a.id === assignee.id)
    if (isSelected) {
      onChange(assignees.filter((a) => a.id !== assignee.id))
    } else {
      onChange([...assignees, assignee])
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal h-9 sm:h-10"
          disabled={disabled}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <Users className="size-3.5 sm:size-4 text-muted-foreground shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {assignees.length === 0
                ? "Nenhum responsável"
                : assignees.length === 1
                ? assignees[0].name
                : `${assignees.length} responsáveis`}
            </span>
          </div>
          <ChevronDown className="size-3.5 sm:size-4 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-4rem)] sm:w-[280px] p-0" align="start">
        <div className="p-1.5 sm:p-2">
          <div className="text-[10px] sm:text-xs font-medium text-muted-foreground px-2 py-1.5">
            Selecionar responsáveis
          </div>
          <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto">
            {availableAssignees.map((assignee) => {
              const isSelected = assignees.some((a) => a.id === assignee.id)
              return (
                <button
                  key={assignee.id}
                  type="button"
                  onClick={() => toggleAssignee(assignee)}
                  className={cn(
                    "w-full flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded hover:bg-muted transition-colors",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="size-5 sm:size-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-primary shrink-0">
                    {getInitials(assignee.name)}
                  </div>
                  <span className="flex-1 text-left truncate">{assignee.name}</span>
                  {isSelected && (
                    <Check className="size-3.5 sm:size-4 text-primary shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

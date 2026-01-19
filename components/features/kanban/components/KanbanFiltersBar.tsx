"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { KanbanFilters } from "../types/kanban.types"

interface KanbanFiltersBarProps {
  filters: KanbanFilters
  onFiltersChange: (filters: KanbanFilters) => void
}

export function KanbanFiltersBar({
  filters,
  onFiltersChange,
}: KanbanFiltersBarProps) {
  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === "all" ? undefined : (value as "LOW" | "MEDIUM" | "HIGH"),
    })
  }

  const handleOnlyOverdueToggle = () => {
    onFiltersChange({
      ...filters,
      onlyOverdue: !filters.onlyOverdue,
    })
  }

  const hasActiveFilters =
    filters.priority || filters.onlyOverdue || filters.assigneeId

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-12 items-center gap-3 px-6">



        {/* Limpar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}

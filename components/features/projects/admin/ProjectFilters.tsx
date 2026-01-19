"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { ProjectStatus, TaskUnit, ProjectFilters as ProjectFiltersType } from "./project.types"
import { statusLabelMap } from "./ProjectStatusBadge"
import { UNIT_LABELS } from "./project.constants"

interface ProjectFiltersProps {
  filters: ProjectFiltersType
  onFiltersChange: (filters: ProjectFiltersType) => void
  onClearFilters: () => void
}

export function ProjectFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: ProjectFiltersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hasActiveFilters = filters.q || filters.status || filters.unit

  const handleFilterChange = (key: keyof ProjectFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1, // Reset page when filter changes
    })
  }

  // Evitar hydration mismatch: renderizar Selects apenas no cliente
  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou código…"
              value={filters.q || ""}
              onChange={(e) => handleFilterChange("q", e.target.value || undefined)}
              className="pl-9 h-10 w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Placeholder para os selects durante SSR */}
            <div className="h-10 w-full sm:w-[140px] rounded-md border bg-background animate-pulse" />
            <div className="h-10 w-full sm:w-[130px] rounded-md border bg-background animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Busca e Filtros em linha */}
      <div className="flex flex-col gap-2">
        {/* Campo de busca */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={filters.q || ""}
            onChange={(e) => handleFilterChange("q", e.target.value || undefined)}
            className="pl-8 sm:pl-9 h-8 sm:h-9 md:h-10 w-full text-xs sm:text-sm"
          />
        </div>

        {/* Filtros em linha com scroll horizontal */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : (value as ProjectStatus))
            }
          >
            <SelectTrigger className="h-8 sm:h-9 md:h-10 w-[100px] sm:w-[120px] md:w-[140px] text-xs sm:text-sm shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabelMap).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.unit || "all"}
            onValueChange={(value) =>
              handleFilterChange("unit", value === "all" ? undefined : (value as TaskUnit))
            }
          >
            <SelectTrigger className="h-8 sm:h-9 md:h-10 w-[80px] sm:w-[100px] md:w-[110px] text-xs sm:text-sm shrink-0">
              <SelectValue placeholder="Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(UNIT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm shrink-0 px-2 sm:px-3"
            >
              <X className="size-3.5 sm:size-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


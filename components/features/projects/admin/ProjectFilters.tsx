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
    <div className="space-y-3">
      {/* Busca e Filtros em linha */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Campo de busca */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código…"
            value={filters.q || ""}
            onChange={(e) => handleFilterChange("q", e.target.value || undefined)}
            className="pl-9 h-10 w-full text-sm"
          />
        </div>

        {/* Filtros em linha */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange("status", value === "all" ? undefined : (value as ProjectStatus))
            }
          >
            <SelectTrigger className="h-10 w-full sm:w-[140px] text-sm">
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
            <SelectTrigger className="h-10 w-full sm:w-[110px] text-sm">
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
              className="h-10 text-sm shrink-0 px-3"
            >
              <X className="size-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


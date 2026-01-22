"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColaboradoresToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onRefresh: () => void
  activeFiltersCount: number
  onClearFilters: () => void
}

export function ColaboradoresToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  activeFiltersCount,
  onClearFilters,
}: ColaboradoresToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      {/* Busca */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou departamento..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9 sm:h-10 text-sm"
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 shrink-0">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-9 sm:h-10 w-[140px] sm:w-[160px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <X className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Limpar</span>
            <span className="sm:hidden">Limpar</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-9 sm:h-10 px-2 sm:px-3"
        >
          <RefreshCw className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline ml-1 sm:ml-2">Atualizar</span>
        </Button>
      </div>
    </div>
  )
}

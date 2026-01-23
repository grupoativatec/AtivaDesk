"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Filter } from "lucide-react"
import { FiltrosDialog } from "./FiltrosDialog"

interface AcessosToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  departamentoFilter: string
  onDepartamentoFilterChange: (value: string) => void
  categoriaFilter: string
  onCategoriaFilterChange: (value: string) => void
  departamentos: string[]
  categorias: Array<{ id: string; nome: string }>
  onRefresh: () => void
  activeFiltersCount: number
  onClearFilters: () => void
}

export function AcessosToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  departamentoFilter,
  onDepartamentoFilterChange,
  categoriaFilter,
  onCategoriaFilterChange,
  departamentos,
  categorias,
  onRefresh,
  activeFiltersCount,
  onClearFilters,
}: AcessosToolbarProps) {
  const [isFiltrosDialogOpen, setIsFiltrosDialogOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Busca */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou departamento..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 text-sm bg-background"
          />
        </div>

        {/* Botão de Filtros */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 relative"
          onClick={() => setIsFiltrosDialogOpen(true)}
        >
          <Filter className="size-4 mr-2" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 min-w-5 px-1.5 text-[10px] absolute -top-1.5 -right-1.5"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Botão de Atualizar */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-10 px-3"
        >
          <RefreshCw className="size-4 mr-2" />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </div>

      {/* Dialog de Filtros */}
      <FiltrosDialog
        open={isFiltrosDialogOpen}
        onOpenChange={setIsFiltrosDialogOpen}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        departamentoFilter={departamentoFilter}
        onDepartamentoFilterChange={onDepartamentoFilterChange}
        categoriaFilter={categoriaFilter}
        onCategoriaFilterChange={onCategoriaFilterChange}
        departamentos={departamentos}
        categorias={categorias}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={onClearFilters}
        onApply={onRefresh}
      />
    </>
  )
}

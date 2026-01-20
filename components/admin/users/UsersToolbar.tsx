"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, RefreshCw, Filter } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface UsersToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onRefresh: () => void
  activeFiltersCount: number
  onClearFilters: () => void
}

export function UsersToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  activeFiltersCount,
  onClearFilters,
}: UsersToolbarProps) {
  const isMobile = useIsMobile()
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch com Radix UI Select
  useEffect(() => {
    setMounted(true)
  }, [])

  const hasActiveFilters = activeFiltersCount > 0

  const filtersContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Cargo</label>
        {mounted ? (
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os cargos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="AGENT">Agente</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm flex items-center">
            {roleFilter === "all" ? "Todos os cargos" : roleFilter === "USER" ? "Usuário" : roleFilter === "AGENT" ? "Agente" : "Administrador"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        {mounted ? (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Desativados</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-9 w-full rounded-md border bg-background px-3 py-2 text-sm flex items-center">
            {statusFilter === "all" ? "Todos" : statusFilter === "active" ? "Ativos" : "Desativados"}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onClearFilters()
            if (isMobile) setFiltersSheetOpen(false)
          }}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Toolbar mobile */}
        <div className="flex items-center gap-2">
          <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{filtersContent}</div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Chips de filtros ativos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {roleFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Cargo: {roleFilter === "USER" ? "Usuário" : roleFilter === "AGENT" ? "Agente" : "Administrador"}
                <button
                  onClick={() => onRoleFilterChange("all")}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter === "active" ? "Ativos" : "Desativados"}
                <button
                  onClick={() => onStatusFilterChange("all")}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop: busca e filtros em linha */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {mounted ? (
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="AGENT">Agente</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-9 w-[180px] rounded-md border bg-background px-3 py-2 text-sm flex items-center">
            {roleFilter === "all" ? "Todos os cargos" : roleFilter === "USER" ? "Usuário" : roleFilter === "AGENT" ? "Agente" : "Administrador"}
          </div>
        )}

        {mounted ? (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Desativados</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-9 w-[180px] rounded-md border bg-background px-3 py-2 text-sm flex items-center">
            {statusFilter === "all" ? "Todos" : statusFilter === "active" ? "Ativos" : "Desativados"}
          </div>
        )}

        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Chips de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {roleFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Cargo: {roleFilter === "USER" ? "Usuário" : roleFilter === "AGENT" ? "Agente" : "Administrador"}
              <button
                onClick={() => onRoleFilterChange("all")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter === "active" ? "Ativos" : "Desativados"}
              <button
                onClick={() => onStatusFilterChange("all")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  )
}

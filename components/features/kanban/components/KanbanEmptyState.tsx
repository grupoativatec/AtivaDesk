"use client"

import { Button } from "@/components/ui/button"
import { Plus, FilterX, FolderKanban } from "lucide-react"

interface KanbanEmptyStateProps {
  type: "no-columns" | "no-cards" | "no-results"
  onCreateCard?: () => void
  onClearFilters?: () => void
}

export function KanbanEmptyState({
  type,
  onCreateCard,
  onClearFilters,
}: KanbanEmptyStateProps) {
  if (type === "no-columns") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma coluna encontrada</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este board não possui colunas configuradas
        </p>
      </div>
    )
  }

  if (type === "no-cards") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-sm text-muted-foreground mb-4">
          Nenhum card nesta coluna
        </p>
        {onCreateCard && (
          <Button size="sm" onClick={onCreateCard}>
            <Plus className="h-4 w-4 mr-2" />
            Criar card
          </Button>
        )}
      </div>
    )
  }

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sem resultados</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Nenhum card corresponde aos filtros aplicados
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <FilterX className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </div>
    )
  }

  return null
}

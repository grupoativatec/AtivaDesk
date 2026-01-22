"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FiltrosDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  departamentoFilter: string
  onDepartamentoFilterChange: (value: string) => void
  categoriaFilter: string
  onCategoriaFilterChange: (value: string) => void
  departamentos: string[]
  categorias: Array<{ id: string; nome: string }>
  activeFiltersCount: number
  onClearFilters: () => void
  onApply: () => void
}

export function FiltrosDialog({
  open,
  onOpenChange,
  statusFilter,
  onStatusFilterChange,
  departamentoFilter,
  onDepartamentoFilterChange,
  categoriaFilter,
  onCategoriaFilterChange,
  departamentos,
  categorias,
  activeFiltersCount,
  onClearFilters,
  onApply,
}: FiltrosDialogProps) {
  const handleClear = () => {
    onClearFilters()
    onApply()
  }

  const handleApply = () => {
    onApply()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Selecione os filtros para refinar sua busca
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Departamento */}
          <div className="space-y-2">
            <Label htmlFor="departamento" className="text-sm font-medium">
              Departamento
            </Label>
            <Select
              value={departamentoFilter}
              onValueChange={onDepartamentoFilterChange}
            >
              <SelectTrigger id="departamento" className="w-full">
                <SelectValue placeholder="Selecione o departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os departamentos</SelectItem>
                {departamentos.length > 0 ? (
                  departamentos.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhum departamento disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-medium">
              Categoria
            </Label>
            <Select
              value={categoriaFilter}
              onValueChange={onCategoriaFilterChange}
            >
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhuma categoria disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-initial"
            >
              Aplicar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

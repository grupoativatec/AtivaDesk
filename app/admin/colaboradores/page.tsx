"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ColaboradoresToolbar } from "@/components/features/colaboradores/admin/ColaboradoresToolbar"
import { ColaboradoresTable } from "@/components/features/colaboradores/admin/ColaboradoresTable"
import { CreateColaboradorModal } from "@/components/features/colaboradores/admin/CreateColaboradorModal"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { UserPlus, Users, Tag } from "lucide-react"
import { CategoriasDialog } from "@/components/features/colaboradores/admin/CategoriasDialog"

interface ColaboradorExterno {
  id: string
  nome: string
  email: string | null
  senha: string | null
  departamento: string | null
  categoriaId: string | null
  categoria: {
    id: string
    nome: string
  } | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  registradoPor: {
    id: string
    name: string
    email: string
  } | null
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<ColaboradorExterno[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    pageSize: number
    total: number
    totalPages: number
  } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCategoriasDialogOpen, setIsCategoriasDialogOpen] = useState(false)

  // Debounce para busca
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset para primeira página ao buscar
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Buscar colaboradores
  const fetchColaboradores = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim())
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      params.append("page", page.toString())
      params.append("pageSize", "10")

      const res = await fetch(`/api/admin/colaboradores?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar colaboradores")
      }

      setColaboradores(data.colaboradores || [])
      setPagination(data.pagination || null)
    } catch (error: any) {
      console.error("Erro ao buscar colaboradores:", error)
      toast.error(error.message || "Erro ao carregar colaboradores")
      setColaboradores([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchColaboradores()
  }, [debouncedSearch, statusFilter, page])

  const handleRefresh = () => {
    fetchColaboradores()
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("active")
    setPage(1)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (statusFilter !== "all") count++
    return count
  }, [statusFilter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="truncate">Colaboradores Externos</span>
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Controle de colaboradores que ficaram em outro local
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsCategoriasDialogOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Tag className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Categorias</span>
                <span className="sm:hidden">Cats</span>
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <UserPlus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Registrar</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-6">
          {/* Toolbar */}
          <ColaboradoresToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={handleRefresh}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />

          {/* Tabela */}
          <ColaboradoresTable
            colaboradores={colaboradores}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            pagination={pagination || undefined}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal de criação */}
      <CreateColaboradorModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleRefresh}
      />

      {/* Dialog de categorias */}
      <CategoriasDialog
        open={isCategoriasDialogOpen}
        onOpenChange={setIsCategoriasDialogOpen}
      />
    </motion.div>
  )
}

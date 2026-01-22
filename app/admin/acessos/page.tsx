"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { AcessosToolbar } from "@/components/features/acessos/admin/AcessosToolbar"
import { AcessosTable } from "@/components/features/acessos/admin/AcessosTable"
import { CreateAcessoModal } from "@/components/features/acessos/admin/CreateAcessoModal"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { UserPlus, Users, Tag } from "lucide-react"
import { CategoriasDialog } from "@/components/features/acessos/admin/CategoriasDialog"

interface AcessoExterno {
  id: string
  nome: string
  usuario: string | null
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

export default function AcessosPage() {
  const [acessos, setAcessos] = useState<AcessoExterno[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departamentoFilter, setDepartamentoFilter] = useState("all")
  const [categoriaFilter, setCategoriaFilter] = useState("all")
  const [departamentos, setDepartamentos] = useState<string[]>([])
  const [categorias, setCategorias] = useState<Array<{ id: string; nome: string }>>([])
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

  // Buscar categorias e departamentos únicos
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Buscar categorias
        const catRes = await fetch("/api/admin/acessos/categorias")
        const catData = await catRes.json()
        if (catData.ok) {
          setCategorias(catData.categorias || [])
        }

        // Buscar departamentos únicos
        const deptRes = await fetch("/api/admin/acessos/departamentos")
        const deptData = await deptRes.json()
        if (deptData.ok) {
          setDepartamentos(deptData.departamentos || [])
        }
      } catch (error) {
        console.error("Erro ao buscar filtros:", error)
      }
    }
    fetchFilters()
  }, [])

  // Buscar acessos
  const fetchAcessos = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim())
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (departamentoFilter !== "all") {
        params.append("departamento", departamentoFilter)
      }

      if (categoriaFilter !== "all") {
        params.append("categoriaId", categoriaFilter)
      }

      params.append("page", page.toString())
      params.append("pageSize", "10")

      const res = await fetch(`/api/admin/acessos?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar acessos")
      }

      setAcessos(data.acessos || [])
      setPagination(data.pagination || null)
    } catch (error: any) {
      console.error("Erro ao buscar acessos:", error)
      toast.error(error.message || "Erro ao carregar acessos")
      setAcessos([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAcessos()
  }, [debouncedSearch, statusFilter, departamentoFilter, categoriaFilter, page])

  const handleRefresh = () => {
    fetchAcessos()
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setDepartamentoFilter("all")
    setCategoriaFilter("all")
    setPage(1)
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (statusFilter !== "all") count++
    if (departamentoFilter !== "all") count++
    if (categoriaFilter !== "all") count++
    return count
  }, [statusFilter, departamentoFilter, categoriaFilter])

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
                <span className="truncate">Acessos Externos</span>
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Controle de acessos de colaboradores que ficaram em outro local
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
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-5 sm:py-6 md:py-8 space-y-5 sm:space-y-6">
          {/* Toolbar */}
          <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-5">
            <AcessosToolbar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departamentoFilter={departamentoFilter}
              onDepartamentoFilterChange={setDepartamentoFilter}
              categoriaFilter={categoriaFilter}
              onCategoriaFilterChange={setCategoriaFilter}
              departamentos={departamentos}
              categorias={categorias}
              onRefresh={handleRefresh}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Tabela */}
          <AcessosTable
            acessos={acessos}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            pagination={pagination || undefined}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal de criação */}
      <CreateAcessoModal
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

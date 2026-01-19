"use client"

import { useMemo, useTransition, useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { ProjectListItem, ProjectFilters } from "./project.types"
import { ProjectFilters as ProjectFiltersComponent } from "./ProjectFilters"
import { ProjectTable } from "./ProjectTable"
import { ProjectCardGrid } from "./ProjectCardGrid"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, FolderKanban, Grid3x3, List, Plus, RefreshCw } from "lucide-react"
import { parseStatus, parseUnit, parseNumber } from "./project-filters.utils"
import { listProjects } from "@/lib/api/projects"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectListShellProps {
  loading?: boolean
  onCreateProject?: () => void
  onEditProject?: (project: ProjectListItem) => void
  onArchiveProject?: (project: ProjectListItem) => void
  viewMode?: "table" | "cards"
  onViewModeChange?: (mode: "table" | "cards") => void
}

export function ProjectListShell({
  loading: externalLoading,
  onCreateProject,
  onEditProject,
  onArchiveProject,
  viewMode: externalViewMode,
  onViewModeChange: externalOnViewModeChange,
}: ProjectListShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [internalViewMode, setInternalViewMode] = useState<"table" | "cards">("table")

  const loading = externalLoading || isPending || isLoading
  const viewMode = externalViewMode || internalViewMode
  const setViewMode = externalOnViewModeChange || setInternalViewMode

  // Ler filtros da URL com validação
  const filters: ProjectFilters = useMemo(() => {
    return {
      q: searchParams.get("q") || undefined,
      status: parseStatus(searchParams.get("status")),
      unit: parseUnit(searchParams.get("unit")),
      page: parseNumber(searchParams.get("page"), 1),
      pageSize: parseNumber(searchParams.get("pageSize"), 20),
    }
  }, [searchParams])

  // Valores garantidos para paginação (sempre numéricos)
  const currentPage = filters.page ?? 1
  const currentPageSize = filters.pageSize ?? 20

  // Carregar projetos da API
  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      setIsLoading(true)
      try {
        const response = await listProjects(filters)
        if (!cancelled) {
          setProjects(response.projects)
          setTotal(response.total)
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar projetos:", error)
          const message = error instanceof Error ? error.message : "Erro ao carregar projetos"
          toast.error(message)
          setProjects([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [filters])

  const totalPages = Math.max(1, Math.ceil(total / currentPageSize))

  // Atualizar URL sem reload usando useTransition
  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      const mergedFilters = { ...filters, ...newFilters }

      // Atualizar params
      if (mergedFilters.q) {
        params.set("q", mergedFilters.q)
      } else {
        params.delete("q")
      }

      if (mergedFilters.status) {
        params.set("status", mergedFilters.status)
      } else {
        params.delete("status")
      }

      if (mergedFilters.unit) {
        params.set("unit", mergedFilters.unit)
      } else {
        params.delete("unit")
      }

      if (mergedFilters.page && mergedFilters.page > 1) {
        params.set("page", mergedFilters.page.toString())
      } else {
        params.delete("page")
      }

      if (mergedFilters.pageSize && mergedFilters.pageSize !== 20) {
        params.set("pageSize", mergedFilters.pageSize.toString())
      } else {
        params.delete("pageSize")
      }

      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    router.replace(pathname)
  }

  const goToPage = (page: number) => {
    updateFilters({ page })
  }

  // Calcular estatísticas (baseado nos projetos carregados na página atual)
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === "ACTIVE").length
    const archived = projects.filter((p) => p.status === "ARCHIVED").length
    const withTasks = projects.filter((p) => (p._count?.tasks || 0) > 0).length
    return { active, archived, total: total, withTasks }
  }, [projects, total])

  // Função para recarregar projetos
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await listProjects(filters)
      setProjects(response.projects)
      setTotal(response.total)
      toast.success("Projetos atualizados")
    } catch (error) {
      console.error("Erro ao atualizar projetos:", error)
      const message = error instanceof Error ? error.message : "Erro ao atualizar projetos"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.q || filters.status || filters.unit

  return (
    <div className="w-full flex flex-col">
      {/* Header completo */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4">
          {/* Título e ações */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Projetos
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Exibindo {total} {total === 1 ? "projeto" : "projetos"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Toggle de visualização */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
                >
                  <List className="size-3.5 sm:size-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
                >
                  <Grid3x3 className="size-3.5 sm:size-4" />
                </Button>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="shrink-0 h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
              >
                <RefreshCw className={cn("size-3.5 sm:size-4", loading && "animate-spin", "sm:mr-2")} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              {onCreateProject && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onCreateProject}
                  className="shrink-0 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Novo Projeto</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              )}
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">
                Ativos
              </div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.active}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">
                Arquivados
              </div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.archived}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">
                Com Tarefas
              </div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.withTasks}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">
                Total
              </div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.total}</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-2 sm:space-y-3">
            <ProjectFiltersComponent
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="w-full bg-muted/20 dark:bg-background/50 flex-1">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? "Nenhum projeto encontrado" : "Nenhum projeto cadastrado"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Tente ajustar os filtros ou limpar a busca"
                  : "Comece criando seu primeiro projeto"}
              </p>
              <div className="flex items-center gap-2">
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                ) : (
                  <>
                    {onCreateProject && (
                      <Button onClick={onCreateProject}>
                        <Plus className="size-4 mr-2" />
                        Criar Projeto
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                      <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
                      Atualizar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Visualização */}
              {viewMode === "table" ? (
                <ProjectTable
                  projects={projects}
                  onEdit={onEditProject}
                  onArchive={onArchiveProject}
                />
              ) : (
                <ProjectCardGrid
                  projects={projects}
                  onEdit={onEditProject}
                  onArchive={onArchiveProject}
                />
              )}

              {/* Paginação */}
              {total > currentPageSize && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages} • {total} projeto{total !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Próxima
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


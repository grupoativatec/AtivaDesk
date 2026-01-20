"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { DocCard, type Doc } from "@/components/features/docs/DocCard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { FileText, Search, Filter, ArrowUpDown, Folder, CheckCircle2, User, X } from "lucide-react"
import { toast } from "sonner"

type SortOption = "recent" | "oldest" | "az" | "views"

export default function DocsHubPage() {
  const isMobile = useIsMobile()

  const [docs, setDocs] = useState<Doc[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
  const [onlyPublished, setOnlyPublished] = useState(false)
  const [onlyMine, setOnlyMine] = useState(false)
  const [showArchivedOnly, setShowArchivedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false)

  // Debounce para busca
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Buscar documentos do backend
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()

        if (debouncedSearchQuery.trim()) {
          params.append("search", debouncedSearchQuery.trim())
        }

        if (categoryFilter !== "all") {
          params.append("category", categoryFilter)
        }

        if (onlyPublished) {
          params.append("status", "published")
        }

        if (onlyMine) {
          params.append("onlyMine", "true")
        }

        if (showArchivedOnly) {
          params.append("archived", "true")
        } else {
          params.append("archived", "false")
        }

        params.append("sortBy", sortBy)

        const res = await fetch(`/api/admin/docs?${params.toString()}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erro ao buscar documentos")
        }

        setDocs(data.docs || [])
      } catch (error: any) {
        console.error("Erro ao buscar documentos:", error)
        toast.error(error.message || "Erro ao carregar documentos")
        setDocs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocs()
  }, [debouncedSearchQuery, categoryFilter, onlyPublished, onlyMine, showArchivedOnly, sortBy])

  const docsCount = docs.length

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (categoryFilter !== "all") count++
    if (onlyPublished) count++
    if (onlyMine) count++
    if (showArchivedOnly) count++
    return count
  }, [categoryFilter, onlyPublished, onlyMine, showArchivedOnly])

  // Filtros aplicados para mostrar como chips
  const activeFilters = useMemo(() => {
    const filters: Array<{ label: string; onRemove: () => void }> = []
    if (categoryFilter !== "all") {
      filters.push({
        label: `Categoria: ${categoryFilter}`,
        onRemove: () => setCategoryFilter("all"),
      })
    }
    if (onlyPublished) {
      filters.push({
        label: "Publicados",
        onRemove: () => setOnlyPublished(false),
      })
    }
    if (onlyMine) {
      filters.push({
        label: "Meus docs",
        onRemove: () => setOnlyMine(false),
      })
    }
    if (showArchivedOnly) {
      filters.push({
        label: "Arquivados",
        onRemove: () => setShowArchivedOnly(false),
      })
    }
    return filters
  }, [categoryFilter, onlyPublished, onlyMine, showArchivedOnly])

  // Input de busca (vai no topo da sidebar no desktop, full width no mobile)
  const searchInput = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder="Buscar documentos..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-10 pl-9 pr-3 text-sm bg-background border-border/50 focus:border-primary/50"
      />
    </div>
  )

  // Conteúdo da sidebar (filtros e ordenação)
  const sidebarContent = (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Filtros
          </h3>
        </div>

        <div className="space-y-4">
          {/* Categoria */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Folder className="size-3.5" />
              <span>Categoria</span>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}
            >
              <SelectTrigger className="h-9 text-sm bg-background border-border/50 hover:border-border">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="Infra">Infra</SelectItem>
                <SelectItem value="Sistemas">Sistemas</SelectItem>
                <SelectItem value="Processos">Processos</SelectItem>
                <SelectItem value="Segurança">Segurança</SelectItem>
                <SelectItem value="Geral">Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group">
              <Checkbox
                checked={onlyPublished}
                onCheckedChange={(checked) => setOnlyPublished(!!checked)}
                className="h-4 w-4"
              />
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle2 className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-foreground">Somente publicados</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group">
              <Checkbox
                checked={onlyMine}
                onCheckedChange={(checked) => setOnlyMine(!!checked)}
                className="h-4 w-4"
              />
              <div className="flex items-center gap-2 flex-1">
                <User className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-foreground">Somente meus docs</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group">
              <Checkbox
                checked={showArchivedOnly}
                onCheckedChange={(checked) => setShowArchivedOnly(!!checked)}
                className="h-4 w-4"
              />
              <div className="flex items-center gap-2 flex-1">
                <FileText className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-foreground">Somente arquivados</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Ordenação */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Ordenar
          </h3>
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-9 text-sm bg-background border-border/50 hover:border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recentes</SelectItem>
            <SelectItem value="oldest">Mais antigos</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
            <SelectItem value="views">Mais acessados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <DocsShell
      pageTitle="Todos os documentos"
      sidebarExtra={sidebarContent}
      searchInput={searchInput}
    >
      {/* Resumo */}
      <div className="mb-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{docsCount}</span>{" "}
          documento{docsCount === 1 ? "" : "s"} encontrado{docsCount === 1 ? "" : "s"}
        </p>
      </div>

      {/* Lista / estados */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-full">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
                <div className="pt-3 border-t space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : docsCount === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum documento encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery || categoryFilter !== "all" || onlyPublished || onlyMine || showArchivedOnly
                  ? "Tente ajustar os filtros ou a busca para encontrar documentos."
                  : "Comece criando seu primeiro documento de documentação."}
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button asChild size="sm">
                <Link href="/admin/docs/new">Criar documento</Link>
              </Button>
              {(searchQuery || categoryFilter !== "all" || onlyPublished || onlyMine || showArchivedOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                    setOnlyPublished(false)
                    setOnlyMine(false)
                    setShowArchivedOnly(false)
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {(searchQuery || categoryFilter !== "all" || onlyPublished || onlyMine || showArchivedOnly) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Resultados da busca
              </h3>
            </div>
          )}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {docs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </>
      )}
    </DocsShell>
  )
}

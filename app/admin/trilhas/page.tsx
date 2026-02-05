"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Search, Filter, ArrowUpDown, Folder, CheckCircle2, Pin } from "lucide-react"
import { TrilhasPostCard } from "@/components/features/admin/trilhas/TrilhasPostCard"
import { TrilhasAdminShell } from "@/components/features/admin/trilhas/TrilhasAdminShell"
import { fetchJson } from "@/lib/http"
import { CreateCategoryDialog } from "@/components/features/admin/trilhas/CreateCategoryDialog"

type SortOption = "recent" | "oldest" | "az"
type StatusFilter = "all" | "DRAFT" | "PUBLISHED" | "ARCHIVED"

type Category = { id: string; name: string; slug: string; color: string | null; order: number }
type Post = {
    id: string
    slug: string
    title: string
    excerpt: string
    updatedAt: string
    pinned: boolean
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    category: { name: string; slug: string; color: string | null }
}

export default function AdminTrilhasPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string | "all">("all")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [onlyPinned, setOnlyPinned] = useState(false)
    const [sortBy, setSortBy] = useState<SortOption>("recent")

    const [showCreateCategory, setShowCreateCategory] = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300)
        return () => clearTimeout(t)
    }, [searchQuery])

    const loadCategories = async () => {
        const data = await fetchJson<{ categories: Category[] }>("/api/admin/trilhas/categories")
        setCategories(data.categories || [])
    }

    // categories
    useEffect(() => {
        const run = async () => {
            try {
                await loadCategories()
            } catch (e: any) {
                toast.error(e.message || "Erro ao carregar categorias")
            }
        }
        run()
    }, [])

    // posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true)

                const params = new URLSearchParams()
                if (debouncedSearch) params.append("q", debouncedSearch)
                if (categoryFilter !== "all") params.append("cat", categoryFilter)
                if (statusFilter !== "all") params.append("status", statusFilter)
                if (onlyPinned) params.append("pinned", "true")

                const data = await fetchJson<{ posts: Post[] }>(`/api/admin/trilhas?${params.toString()}`)
                let list: Post[] = data.posts || []

                // sort client-side
                list = [...list].sort((a, b) => {
                    if (sortBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
                    return a.title.localeCompare(b.title, "pt-BR")
                })

                setPosts(list)
            } catch (e: any) {
                toast.error(e.message || "Erro ao carregar posts")
                setPosts([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchPosts()
    }, [debouncedSearch, categoryFilter, statusFilter, onlyPinned, sortBy])

    const postsCount = posts.length

    const activeFiltersCount = useMemo(() => {
        let c = 0
        if (categoryFilter !== "all") c++
        if (statusFilter !== "all") c++
        if (onlyPinned) c++
        if (debouncedSearch) c++
        return c
    }, [categoryFilter, statusFilter, onlyPinned, debouncedSearch])

    const searchInput = (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
                placeholder="Buscar trilhas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-3 text-sm bg-background border-border/50 focus:border-primary/50"
            />
        </div>
    )

    const sidebarContent = (
        <div className="space-y-6">
            {/* CTA */}
            <div className="space-y-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateCategory(true)}
                >
                    + Nova categoria
                </Button>
            </div>

            {/* Filtros */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Filtros {activeFiltersCount ? `(${activeFiltersCount})` : ""}
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Folder className="size-3.5" />
                            <span>Categoria</span>
                        </div>
                        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
                            <SelectTrigger className="h-9 text-sm bg-background border-border/50 hover:border-border">
                                <SelectValue placeholder="Todas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.slug}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5" />
                            <span>Status</span>
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                            <SelectTrigger className="h-9 text-sm bg-background border-border/50 hover:border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="DRAFT">DRAFT</SelectItem>
                                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <label className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group">
                        <Checkbox checked={onlyPinned} onCheckedChange={(v) => setOnlyPinned(!!v)} className="h-4 w-4" />
                        <div className="flex items-center gap-2 flex-1">
                            <Pin className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm text-foreground">Somente fixados</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Ordenação */}
            <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                    <ArrowUpDown className="size-3.5 text-muted-foreground" />
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Ordenar</h3>
                </div>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-9 text-sm bg-background border-border/50 hover:border-border">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Mais recentes</SelectItem>
                        <SelectItem value="oldest">Mais antigos</SelectItem>
                        <SelectItem value="az">A–Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    return (
        <>
            <TrilhasAdminShell pageTitle="Trilhas (Admin)" sidebarExtra={sidebarContent} searchInput={searchInput}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">{postsCount}</span>{" "}
                            post{postsCount === 1 ? "" : "s"} encontrado{postsCount === 1 ? "" : "s"}
                        </p>

                        <Button asChild size="sm">
                            <Link href="/admin/trilhas/new">Criar post</Link>
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="h-full">
                                    <CardContent className="pt-6 space-y-4">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                        <div className="flex gap-2 pt-2">
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                        </div>
                                        <div className="pt-3 border-t">
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : postsCount === 0 ? (
                        <Card>
                            <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground">Nenhum post encontrado</h3>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        Tente ajustar os filtros/busca, ou crie um novo post de trilha.
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Button asChild size="sm">
                                        <Link href="/admin/trilhas/new">Criar post</Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery("")
                                            setCategoryFilter("all")
                                            setStatusFilter("all")
                                            setOnlyPinned(false)
                                        }}
                                    >
                                        Limpar filtros
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            {posts.map((p) => (
                                <TrilhasPostCard key={p.id} post={p} />
                            ))}
                        </div>
                    )}
                </motion.div>
            </TrilhasAdminShell>

            <CreateCategoryDialog
                open={showCreateCategory}
                onOpenChange={setShowCreateCategory}
                onCreated={async () => {
                    try {
                        await loadCategories()
                    } catch (e: any) {
                        toast.error(e.message || "Erro ao atualizar categorias")
                    }
                }}
            />
        </>
    )
}

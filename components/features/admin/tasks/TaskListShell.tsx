"use client"

import { useMemo, useTransition, useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { TaskListItem, TaskFilters } from "./task.types"
import { TaskFilters as TaskFiltersComponent } from "./TaskFilters"
import { TaskTable } from "./TaskTable"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react"
import { parseStatus, parsePriority, parseUnit, parseNumber } from "./task-filters.utils"
import { listTasks } from "@/lib/api"
import { toast } from "sonner"


interface TaskListShellProps {
    loading?: boolean
}

export function TaskListShell({ loading: externalLoading }: TaskListShellProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [tasks, setTasks] = useState<TaskListItem[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const loading = externalLoading || isPending || isLoading

    // Ler filtros da URL com validação
    const filters: TaskFilters = useMemo(() => {
        return {
            q: searchParams.get("q") || undefined,
            status: parseStatus(searchParams.get("status")),
            priority: parsePriority(searchParams.get("priority")),
            unit: parseUnit(searchParams.get("unit")),
            project: searchParams.get("project") || undefined,
            page: parseNumber(searchParams.get("page"), 1),
            pageSize: parseNumber(searchParams.get("pageSize"), 20),
        }
    }, [searchParams])

    // Valores garantidos para paginação (sempre numéricos)
    const currentPage = filters.page ?? 1
    const currentPageSize = filters.pageSize ?? 20

    // Carregar tarefas da API
    useEffect(() => {
        let cancelled = false

        async function loadTasks() {
            setIsLoading(true)
            try {
                const response = await listTasks(filters)
                if (!cancelled) {
                    setTasks(response.tasks)
                    setTotal(response.total)
                }
            } catch (error: any) {
                if (!cancelled) {
                    console.error("Erro ao carregar tarefas:", error)
                    toast.error(error.message || "Erro ao carregar tarefas")
                    setTasks([])
                    setTotal(0)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadTasks()

        return () => {
            cancelled = true
        }
    }, [filters])

    const totalPages = Math.ceil(total / currentPageSize)

    // Atualizar URL sem reload usando useTransition
    const updateFilters = (newFilters: Partial<TaskFilters>) => {
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

            if (mergedFilters.priority) {
                params.set("priority", mergedFilters.priority)
            } else {
                params.delete("priority")
            }

            if (mergedFilters.unit) {
                params.set("unit", mergedFilters.unit)
            } else {
                params.delete("unit")
            }

            if (mergedFilters.project) {
                params.set("project", mergedFilters.project)
            } else {
                params.delete("project")
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

    // Extrair projetos únicos das tarefas carregadas
    const projects = useMemo(() => {
        const projectMap = new Map<string, { id: string; name: string }>()
        tasks.forEach((task) => {
            if (!projectMap.has(task.project.id)) {
                projectMap.set(task.project.id, task.project)
            }
        })
        return Array.from(projectMap.values())
    }, [tasks])

    return (
        <div className="w-full flex flex-col">
            {/* Filtros */}
            <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4">
                    <TaskFiltersComponent
                        filters={filters}
                        projects={projects}
                        onFiltersChange={updateFilters}
                        onClearFilters={clearFilters}
                    />
                </div>
            </div>

            {/* Conteúdo */}
            <div className="w-full bg-muted/20 dark:bg-background/50 flex-1">
                <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ListTodo className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Nenhuma tarefa encontrada
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Tente ajustar os filtros ou limpar a busca
                            </p>
                            <Button variant="outline" onClick={clearFilters}>
                                Limpar filtros
                            </Button>
                        </div>
                    ) : (
                        <>
                            <TaskTable tasks={tasks} />

                            {/* Paginação */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Página {currentPage} de {totalPages} •{" "}
                                        {total} tarefa{total !== 1 ? "s" : ""}
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

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Search,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  UserCheck,
  AlertCircle,
  Filter,
  Ticket as TicketIcon,
  Grid3x3,
  List
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TicketListCard } from "@/components/features/tickets/admin/ticket-list-card"

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
type TicketCategory = "HARDWARE" | "SOFTWARE" | "NETWORK" | "EMAIL" | "ACCESS" | "OTHER"
type TicketUnit = "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"

type TicketWithRelations = {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  unit: TicketUnit | null
  createdAt: string
  updatedAt: string
  openedBy: {
    id: string
    name: string
    email: string
  }
  assignee: {
    id: string
    name: string
    email: string
  } | null
  messages: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    messages: number
    attachments: number
  }
}

type User = {
  id: string
  name: string
  email: string
  role: string
}

type SortField = "priority" | "createdAt" | "status" | null
type SortDirection = "asc" | "desc"

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
    order: 1,
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
    order: 2,
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
    order: 3,
  },
  URGENT: {
    label: "Crítica",
    color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    order: 4,
  },
} as const

const CATEGORY_LABELS: Record<string, string> = {
  HARDWARE: "Hardware",
  SOFTWARE: "Software",
  NETWORK: "Rede",
  EMAIL: "E-mail",
  ACCESS: "Acesso",
  OTHER: "Outro",
}

const CATEGORY_ICONS: Record<string, string> = {
  HARDWARE: "💻",
  SOFTWARE: "⚙️",
  NETWORK: "🌐",
  EMAIL: "📧",
  ACCESS: "🔐",
  OTHER: "📋",
}

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("open") // Filtro padrão: apenas abertos
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [viewMode, setViewMode] = useState<"list" | "cards">("cards")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()

      if (res.ok && data.user) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)

      let allTickets: TicketWithRelations[] = []

      // Se o filtro for "open", buscar ambos OPEN e IN_PROGRESS
      if (statusFilter === "open") {
        const promises = ["OPEN", "IN_PROGRESS"].map(async (status) => {
          const params = new URLSearchParams()
          params.append("status", status)

          if (priorityFilter !== "all") {
            params.append("priority", priorityFilter)
          }

          if (categoryFilter !== "all") {
            params.append("category", categoryFilter)
          }

          if (searchQuery.trim()) {
            params.append("search", searchQuery)
          }

          const res = await fetch(`/api/admin/tickets?${params.toString()}`)
          const data = await res.json()
          return res.ok ? (data.tickets || []) : []
        })

        const results = await Promise.all(promises)
        allTickets = results.flat()

        // Remover duplicatas
        const uniqueTickets = allTickets.filter((ticket: TicketWithRelations, index: number, self: TicketWithRelations[]) =>
          index === self.findIndex((t: TicketWithRelations) => t.id === ticket.id)
        )
        allTickets = uniqueTickets
      } else if (statusFilter !== "all") {
        const params = new URLSearchParams()
        params.append("status", statusFilter)

        if (priorityFilter !== "all") {
          params.append("priority", priorityFilter)
        }

        if (categoryFilter !== "all") {
          params.append("category", categoryFilter)
        }

        if (searchQuery.trim()) {
          params.append("search", searchQuery)
        }

        const res = await fetch(`/api/admin/tickets?${params.toString()}`)
        const data = await res.json()
        allTickets = data.tickets || []
      } else {
        // Buscar todos os tickets
        const params = new URLSearchParams()

        if (priorityFilter !== "all") {
          params.append("priority", priorityFilter)
        }

        if (categoryFilter !== "all") {
          params.append("category", categoryFilter)
        }

        if (searchQuery.trim()) {
          params.append("search", searchQuery)
        }

        const res = await fetch(`/api/admin/tickets?${params.toString()}`)
        const data = await res.json()
        allTickets = data.tickets || []
      }

      setTickets(allTickets)
    } catch (error: any) {
      console.error("Erro ao buscar tickets:", error)
      toast.error(error.message || "Erro ao carregar tickets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchTickets()
    }
  }, [statusFilter, priorityFilter, categoryFilter, currentUser])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTickets()
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Ordenar tickets
  const sortedTickets = useMemo(() => {
    if (!sortField) return tickets

    return [...tickets].sort((a, b) => {
      if (sortField === "priority") {
        const aOrder = PRIORITY_CONFIG[a.priority]?.order || 0
        const bOrder = PRIORITY_CONFIG[b.priority]?.order || 0
        return sortDirection === "asc" ? aOrder - bOrder : bOrder - aOrder
      }

      if (sortField === "createdAt") {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate
      }

      if (sortField === "status") {
        const statusOrder = { OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3, CLOSED: 4 }
        const aOrder = statusOrder[a.status] || 0
        const bOrder = statusOrder[b.status] || 0
        return sortDirection === "asc" ? aOrder - bOrder : bOrder - aOrder
      }

      return 0
    })
  }, [tickets, sortField, sortDirection])

  // Filtrar tickets (já filtrados pelo servidor, mas manter para consistência)
  const filteredTickets = sortedTickets

  // Estatísticas
  const stats = useMemo(() => {
    const open = filteredTickets.filter(t => t.status === "OPEN").length
    const inProgress = filteredTickets.filter(t => t.status === "IN_PROGRESS").length
    const urgent = filteredTickets.filter(t => t.priority === "URGENT").length
    return { open, inProgress, urgent, total: filteredTickets.length }
  }, [filteredTickets])

  const hasActiveFilters = priorityFilter !== "all" || categoryFilter !== "all" || searchQuery !== ""

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col">
      {/* Header com Estatísticas */}
      <div className="border-b border-border bg-card shadow-sm shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Chamados em Aberto
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Exibindo {stats.total} {stats.total === 1 ? "chamado" : "chamados"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle de Visualização */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-8 px-2 sm:px-3"
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-2 sm:px-3"
                >
                  <List className="size-4" />
                </Button>
              </div>
              <Button
                onClick={fetchTickets}
                variant="outline"
                size="sm"
                disabled={loading}
                className="shrink-0"
              >
                <RefreshCw className={cn("size-4 sm:mr-2", loading && "animate-spin")} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          {/* Estatísticas Rápidas - Compactas */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-2.5">
              <div className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">Abertos</div>
              <div className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300">{stats.open}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-2.5">
              <div className="text-[10px] sm:text-xs text-yellow-600 dark:text-yellow-400 font-medium mb-0.5">Em Andamento</div>
              <div className="text-lg sm:text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats.inProgress}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-2.5">
              <div className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">Críticos</div>
              <div className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300">{stats.urgent}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-2 sm:p-2.5">
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-0.5">Total</div>
              <div className="text-lg sm:text-xl font-bold text-foreground">{stats.total}</div>
            </div>
          </div>

          {/* Barra de Busca e Filtros - Compacta */}
          <div className="space-y-2 sm:space-y-3">
            {/* Busca e Filtros em linha compacta */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              {/* Busca */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      fetchTickets()
                    }
                  }}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 w-full text-sm"
                />
              </div>

              {/* Filtros em linha */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[120px] lg:w-[140px] text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                    <SelectItem value="OPEN">Apenas Abertos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[110px] lg:w-[130px] text-xs sm:text-sm">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="URGENT">Crítica</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[110px] lg:w-[130px] text-xs sm:text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="NETWORK">Rede</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="ACCESS">Acesso</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPriorityFilter("all")
                      setCategoryFilter("all")
                      setSearchQuery("")
                    }}
                    className="h-9 text-xs shrink-0 px-2 sm:px-3"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full bg-muted/20">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TicketIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {hasActiveFilters ? "Nenhum chamado encontrado" : "Nenhum chamado em aberto"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Tente ajustar os filtros ou a busca"
                  : "Todos os chamados foram resolvidos ou não há chamados pendentes"}
              </p>
            </div>
          ) : viewMode === "list" ? (
            <>
              {/* Tabela Desktop */}
              <div className="hidden lg:block">
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <button
                              onClick={() => handleSort("priority")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                              Prioridade
                              {sortField === "priority" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="size-3" />
                                ) : (
                                  <ArrowDown className="size-3" />
                                )
                              ) : (
                                <ArrowUpDown className="size-3 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Número / Título
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <button
                              onClick={() => handleSort("status")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                              Status
                              {sortField === "status" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="size-3" />
                                ) : (
                                  <ArrowDown className="size-3" />
                                )
                              ) : (
                                <ArrowUpDown className="size-3 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <button
                              onClick={() => handleSort("createdAt")}
                              className="flex items-center gap-2 hover:text-foreground transition-colors"
                            >
                              Data
                              {sortField === "createdAt" ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp className="size-3" />
                                ) : (
                                  <ArrowDown className="size-3" />
                                )
                              ) : (
                                <ArrowUpDown className="size-3 opacity-50" />
                              )}
                            </button>
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Solicitante
                          </th>
                          <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Responsável
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredTickets.map((ticket) => {
                          const statusConfig = STATUS_CONFIG[ticket.status]
                          const priorityConfig = PRIORITY_CONFIG[ticket.priority]
                          const createdDate = new Date(ticket.createdAt)
                          const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })

                          return (
                            <tr
                              key={ticket.id}
                              className="hover:bg-muted/30 transition-colors cursor-pointer group"
                              onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                            >
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs font-semibold px-2.5 py-1", priorityConfig.color)}
                                >
                                  {priorityConfig.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
                                  </div>
                                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                    {ticket.title}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-base">{CATEGORY_ICONS[ticket.category] || "📋"}</span>
                                  <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs font-medium px-2.5 py-1", statusConfig.color)}
                                >
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="size-3.5" />
                                  <span>{format(createdDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">{timeAgo}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="size-3.5 text-muted-foreground" />
                                  <span className="text-foreground">{ticket.openedBy.name}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <UserCheck className="size-3.5 text-muted-foreground" />
                                  <span className={cn(
                                    "text-foreground",
                                    !ticket.assignee && "text-muted-foreground italic"
                                  )}>
                                    {ticket.assignee ? ticket.assignee.name : "Não definido"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Cards Mobile */}
              <div className="lg:hidden space-y-4">
                {filteredTickets.map((ticket) => {
                  const statusConfig = STATUS_CONFIG[ticket.status]
                  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
                  const createdDate = new Date(ticket.createdAt)
                  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })

                  return (
                    <div
                      key={ticket.id}
                      className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
                            <Badge
                              variant="outline"
                              className={cn("text-xs font-semibold px-2 py-0.5", priorityConfig.color)}
                            >
                              {priorityConfig.label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
                            {ticket.title}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium px-2 py-1 shrink-0", statusConfig.color)}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{CATEGORY_ICONS[ticket.category] || "📋"}</span>
                          <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5" />
                          <span>{format(createdDate, "dd/MM/yyyy", { locale: ptBR })} • {timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="size-3.5" />
                          <span>Solicitante: {ticket.openedBy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="size-3.5" />
                          <span className={cn(!ticket.assignee && "italic")}>
                            Responsável: {ticket.assignee ? ticket.assignee.name : "Não definido"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              {/* Visualização em Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketListCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

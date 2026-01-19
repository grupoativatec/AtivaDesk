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
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/10 dark:text-blue-500/60 dark:border-blue-900/20",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/10 dark:text-yellow-500/60 dark:border-yellow-900/20",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/10 dark:text-green-500/60 dark:border-green-900/20",
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/10 dark:text-gray-400/60 dark:border-gray-900/20",
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/10 dark:text-blue-500/60 dark:border-blue-900/20",
    order: 1,
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/10 dark:text-yellow-500/60 dark:border-yellow-900/20",
    order: 2,
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/10 dark:text-orange-500/60 dark:border-orange-900/20",
    order: 3,
  },
  URGENT: {
    label: "Crítica",
    color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/10 dark:text-red-500/60 dark:border-red-900/20",
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
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Chamados em Aberto
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                Exibindo {stats.total} {stats.total === 1 ? "chamado" : "chamados"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Toggle de Visualização */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1">
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className="h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
                >
                  <Grid3x3 className="size-3.5 sm:size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
                >
                  <List className="size-3.5 sm:size-4" />
                </Button>
              </div>
              <Button
                onClick={fetchTickets}
                variant="outline"
                size="sm"
                disabled={loading}
                className="shrink-0 h-7 sm:h-8 w-7 sm:w-auto px-2 sm:px-3"
              >
                <RefreshCw className={cn("size-3.5 sm:size-4", loading && "animate-spin", "sm:mr-2")} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          {/* Estatísticas Rápidas - Compactas */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4">
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">Abertos</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.open}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">Em Andamento</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.inProgress}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">Críticos</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.urgent}</div>
            </div>
            <div className="bg-muted border border-border rounded-lg p-1.5 sm:p-2 md:p-2.5">
              <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground font-medium mb-0.5 line-clamp-1">Total</div>
              <div className="text-base sm:text-lg md:text-xl font-bold text-foreground">{stats.total}</div>
            </div>
          </div>

          {/* Barra de Busca e Filtros - Compacta */}
          <div className="space-y-2 sm:space-y-3">
            {/* Busca e Filtros em linha compacta */}
            <div className="flex flex-col gap-2">
              {/* Busca */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar chamados..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      fetchTickets()
                    }
                  }}
                  className="pl-8 sm:pl-9 md:pl-10 h-8 sm:h-9 md:h-10 w-full text-xs sm:text-sm"
                />
              </div>

              {/* Filtros em linha */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 sm:h-9 w-[100px] sm:w-[120px] md:w-[140px] text-xs sm:text-sm shrink-0">
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
                  <SelectTrigger className="h-8 sm:h-9 w-[90px] sm:w-[110px] md:w-[130px] text-xs sm:text-sm shrink-0">
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
                  <SelectTrigger className="h-8 sm:h-9 w-[90px] sm:w-[110px] md:w-[130px] text-xs sm:text-sm shrink-0">
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
                    className="h-8 sm:h-9 text-xs shrink-0 px-2 sm:px-3"
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
      <div className="w-full bg-muted/20 dark:bg-background/50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
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
                <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 dark:bg-muted/10 border-b border-border dark:border-border/30">
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
                      <tbody className="divide-y divide-border dark:divide-border/20">
                        {filteredTickets.map((ticket) => {
                          const statusConfig = STATUS_CONFIG[ticket.status]
                          const priorityConfig = PRIORITY_CONFIG[ticket.priority]
                          const createdDate = new Date(ticket.createdAt)
                          const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })

                          return (
                            <tr
                              key={ticket.id}
                              className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors cursor-pointer group"
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
              <div className="lg:hidden space-y-3 sm:space-y-4">
                {filteredTickets.map((ticket) => {
                  const statusConfig = STATUS_CONFIG[ticket.status]
                  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
                  const createdDate = new Date(ticket.createdAt)
                  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true, locale: ptBR })

                  return (
                    <div
                      key={ticket.id}
                      className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 sm:p-4 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-all cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">#{ticket.id.slice(0, 8)}</span>
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5", priorityConfig.color)}
                            >
                              {priorityConfig.label}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-xs sm:text-sm text-foreground mb-1.5 sm:mb-2 line-clamp-2">
                            {ticket.title}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 shrink-0", statusConfig.color)}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-sm sm:text-base">{CATEGORY_ICONS[ticket.category] || "📋"}</span>
                          <span className="line-clamp-1">{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Calendar className="size-3 sm:size-3.5" />
                          <span className="line-clamp-1">{format(createdDate, "dd/MM/yyyy", { locale: ptBR })} • {timeAgo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <User className="size-3 sm:size-3.5" />
                          <span className="line-clamp-1">Solicitante: {ticket.openedBy.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <UserCheck className="size-3 sm:size-3.5" />
                          <span className={cn("line-clamp-1", !ticket.assignee && "italic")}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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

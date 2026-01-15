"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AdminTicketCard } from "@/components/features/tickets/admin/admin-ticket-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Filter, Search, RefreshCw, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

export default function AdminTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("OPEN")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [unitFilter, setUnitFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

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
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (priorityFilter !== "all") {
        params.append("priority", priorityFilter)
      }
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter)
      }
      if (unitFilter !== "all") {
        params.append("unit", unitFilter)
      }
      if (assigneeFilter !== "all") {
        params.append("assigneeId", assigneeFilter)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const res = await fetch(`/api/admin/tickets?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao buscar tickets")
      }

      setTickets(data.tickets || [])
    } catch (error: any) {
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
  }, [statusFilter, priorityFilter, categoryFilter, unitFilter, assigneeFilter, currentUser])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTickets()
  }

  const handleAssign = () => {
    fetchTickets()
  }

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    unitFilter !== "all" ||
    assigneeFilter !== "all" ||
    searchQuery !== ""

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Gerenciar Tickets
              </h1>
              <p className="text-sm text-muted-foreground">
                {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                {hasActiveFilters && " encontrados"}
              </p>
            </div>
            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets por título ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </form>

          {/* Filters - Modal */}
          <div className="flex items-center gap-3">
            <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <Filter className="size-4 mr-2" />
                  Filtros
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="OPEN">Aberto</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                        <SelectItem value="RESOLVED">Resolvido</SelectItem>
                        <SelectItem value="CLOSED">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prioridade</label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="URGENT">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-10">
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
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Unidade</label>
                    <Select value={unitFilter} onValueChange={setUnitFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="ITJ">ITJ</SelectItem>
                        <SelectItem value="SFS">SFS</SelectItem>
                        <SelectItem value="FOZ">FOZ</SelectItem>
                        <SelectItem value="DIO">DIO</SelectItem>
                        <SelectItem value="AOL">AOL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Atribuição</label>
                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Atribuição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="unassigned">Não atribuídos</SelectItem>
                        {currentUser && (
                          <SelectItem value={currentUser.id}>Meus tickets</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-muted/30 rounded-lg">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Filter className="size-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">
                {hasActiveFilters ? "Nenhum ticket encontrado" : "Nenhum ticket ainda"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Tente ajustar os filtros ou a busca"
                  : "Aguardando tickets serem criados"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((ticket) => (
                <AdminTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  currentUserId={currentUser.id}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

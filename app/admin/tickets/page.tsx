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
import { Loader2, Filter, Search, RefreshCw, X } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Modern Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative w-full max-w-8xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-x-0 sm:border-x rounded-none sm:rounded-xl md:rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg p-4 sm:p-6 md:p-8 lg:p-10"
        >
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Gerenciar Tickets
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                  Visualize e gerencie todos os tickets do sistema
                </p>
              </div>
              <Button
                onClick={fetchTickets}
                variant="outline"
                size="default"
                className="shadow-lg w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
                <span className="sm:hidden">Atualizar</span>
              </Button>
            </div>

            {/* Search and Filters */}
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                {/* Mobile Filter Button */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      className="sm:hidden shrink-0"
                    >
                      <Filter className="size-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-11 text-base">
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

                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as prioridades</SelectItem>
                          <SelectItem value="LOW">Baixa</SelectItem>
                          <SelectItem value="MEDIUM">Média</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          <SelectItem value="HARDWARE">Hardware</SelectItem>
                          <SelectItem value="SOFTWARE">Software</SelectItem>
                          <SelectItem value="NETWORK">Rede</SelectItem>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="ACCESS">Acesso</SelectItem>
                          <SelectItem value="OTHER">Outro</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={unitFilter} onValueChange={setUnitFilter}>
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as unidades</SelectItem>
                          <SelectItem value="ITJ">ITJ</SelectItem>
                          <SelectItem value="SFS">SFS</SelectItem>
                          <SelectItem value="FOZ">FOZ</SelectItem>
                          <SelectItem value="DIO">DIO</SelectItem>
                          <SelectItem value="AOL">AOL</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="Atribuição" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="unassigned">Não atribuídos</SelectItem>
                          <SelectItem value={currentUser.id}>Meus tickets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {/* Desktop Filters */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="HARDWARE">Hardware</SelectItem>
                    <SelectItem value="SOFTWARE">Software</SelectItem>
                    <SelectItem value="NETWORK">Rede</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="ACCESS">Acesso</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    <SelectItem value="ITJ">ITJ</SelectItem>
                    <SelectItem value="SFS">SFS</SelectItem>
                    <SelectItem value="FOZ">FOZ</SelectItem>
                    <SelectItem value="DIO">DIO</SelectItem>
                    <SelectItem value="AOL">AOL</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Atribuição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="unassigned">Não atribuídos</SelectItem>
                    <SelectItem value={currentUser.id}>Meus tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </div>

          {/* Tickets Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 sm:py-20 border rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm shadow-sm"
            >
              <div className="max-w-md mx-auto px-4">
                <div className="size-12 sm:size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Filter className="size-6 sm:size-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || unitFilter !== "all" || assigneeFilter !== "all"
                    ? "Nenhum ticket encontrado"
                    : "Nenhum ticket ainda"}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all" || unitFilter !== "all" || assigneeFilter !== "all"
                    ? "Tente ajustar os filtros ou a busca"
                    : "Aguardando tickets serem criados"}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <AdminTicketCard
                    ticket={ticket}
                    gradientIndex={index}
                    currentUserId={currentUser.id}
                    onAssign={handleAssign}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {!loading && tickets.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t"
            >
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Mostrando <span className="font-semibold text-foreground">{tickets.length}</span> ticket
                {tickets.length !== 1 ? "s" : ""}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

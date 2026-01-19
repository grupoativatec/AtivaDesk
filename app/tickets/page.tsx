"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TicketCard } from "@/components/features/tickets/shared/ticket-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2, Filter, Search, Grid3x3, List, Clock, MessageSquare, Paperclip } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { NewTicketModal } from "@/components/features/tickets/shared/new-ticket-modal"

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

type TicketWithRelations = {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  createdAt: string
  updatedAt: string
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

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "cards">("list")

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const res = await fetch(`/api/tickets?${params.toString()}`)
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
    fetchTickets()
  }, [statusFilter])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open)
  }

  const handleTicketCreated = () => {
    // Atualizar lista de tickets após criar um novo
    fetchTickets()
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      ticket.title.toLowerCase().includes(query) ||
      ticket.description.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Meus Chamados
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                Gerencie e acompanhe todos os seus chamados
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Toggle de Visualização */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-muted rounded-lg p-0.5 sm:p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
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
                onClick={handleOpenModal}
                size="sm"
                className="h-7 sm:h-8 md:h-10 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Novo Chamado</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar chamados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 md:pl-10 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
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
        </div>

        {/* Tickets Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 border border-border rounded-lg bg-card">
            <div className="max-w-md mx-auto">
              <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Filter className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "Nenhum chamado encontrado"
                  : "Nenhum chamado ainda"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Tente ajustar os filtros ou a busca"
                  : "Comece criando seu primeiro chamado"}
              </p>
              {(!searchQuery && statusFilter === "all") && (
                <Button onClick={handleOpenModal} size="default">
                  <Plus className="size-4 mr-2" />
                  Criar primeiro chamado
                </Button>
              )}
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* Visualização em Lista */
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => router.push(`/tickets/${ticket.id}`)}
                className="bg-card dark:bg-card/50 border border-border dark:border-border/50 rounded-lg p-4 sm:p-5 hover:shadow-md dark:hover:shadow-none transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1 flex-1">
                        {ticket.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 shrink-0",
                          ticket.status === "OPEN" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400/80 dark:border-blue-900/30",
                          ticket.status === "IN_PROGRESS" && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400/80 dark:border-yellow-900/30",
                          ticket.status === "RESOLVED" && "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400/80 dark:border-green-900/30",
                          ticket.status === "CLOSED" && "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400/80 dark:border-gray-900/30"
                        )}
                      >
                        {ticket.status === "OPEN" && "Aberto"}
                        {ticket.status === "IN_PROGRESS" && "Em Andamento"}
                        {ticket.status === "RESOLVED" && "Resolvido"}
                        {ticket.status === "CLOSED" && "Fechado"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {ticket.description
                        .replace(/<[^>]*>/g, "")
                        .replace(/&nbsp;/g, " ")
                        .trim()}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                      {ticket._count.messages > 0 && (
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="size-3.5" />
                          <span>{ticket._count.messages} {ticket._count.messages === 1 ? "comentário" : "comentários"}</span>
                        </div>
                      )}
                      {ticket._count.attachments > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Paperclip className="size-3.5" />
                          <span>{ticket._count.attachments} {ticket._count.attachments === 1 ? "anexo" : "anexos"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Visualização em Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket as any} />
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!loading && filteredTickets.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Mostrando <span className="font-semibold text-foreground">{filteredTickets.length}</span> chamado
              {filteredTickets.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Novo Chamado */}
      <NewTicketModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        onSuccess={handleTicketCreated}
      />
    </div>
  )
}

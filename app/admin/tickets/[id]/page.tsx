"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TicketDetails } from "@/components/features/tickets/shared/ticket-details"
import { MessageList } from "@/components/features/tickets/shared/message-list"
import { MessageForm } from "@/components/features/tickets/shared/message-form"
import { AdminTicketEditModal } from "@/components/features/tickets/admin/admin-ticket-edit-modal"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Ticket = {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  unit?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  inProgressAt?: string | Date | null
  timeSpentMinutes?: number | null
  timerPaused?: boolean
  timerPausedAt?: string | Date | null
  totalPausedSeconds?: number
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
    createdAt: string | Date
    author: {
      id: string
      name: string
      email: string
    }
  }>
  attachments: Array<{
    id: string
    filename: string
    url: string
    mimeType: string
    size: number
    createdAt: string | Date
  }>
}

type User = {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminTicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const leftContainerRef = useRef<HTMLDivElement>(null)
  const rightContainerRef = useRef<HTMLDivElement>(null)
  const rightInnerContainerRef = useRef<HTMLDivElement>(null)

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

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        cache: 'no-store',
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Resposta não é JSON:", text.substring(0, 200))
        throw new Error("Resposta inválida do servidor")
      }

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Ticket não encontrado")
          router.push("/admin/tickets")
          return
        }
        throw new Error(data.error || "Erro ao buscar ticket")
      }

      setTicket(data.ticket)
    } catch (error: any) {
      console.error("Erro ao buscar ticket:", error)
      toast.error(error.message || "Erro ao carregar ticket")
      router.push("/admin/tickets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (ticketId && currentUser) {
      fetchTicket()
    }
  }, [ticketId, currentUser])

  // Sincronizar altura do container de chat com o container de detalhes
  useEffect(() => {
    if (!leftContainerRef.current || !rightInnerContainerRef.current) return

    const syncHeights = () => {
      if (leftContainerRef.current && rightInnerContainerRef.current) {
        const leftHeight = leftContainerRef.current.offsetHeight
        // Aplicar altura exata do container de detalhes no container interno do chat
        rightInnerContainerRef.current.style.height = `${leftHeight}px`
        rightInnerContainerRef.current.style.maxHeight = `${leftHeight}px`
      }
    }

    // Sincronizar inicialmente com um pequeno delay para garantir que o layout esteja renderizado
    const timeoutId = setTimeout(syncHeights, 100)
    syncHeights()

    // Observar mudanças no container da esquerda
    const resizeObserver = new ResizeObserver(syncHeights)
    resizeObserver.observe(leftContainerRef.current)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [ticket])

  const handleMessageSent = (newMessage: any) => {
    setTimeout(() => {
      fetchTicket()
    }, 500)
  }

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shrink-0">
        <div className="px-6 py-4 max-w-7xl mx-auto w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/tickets")}
          >
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Ticket Details */}
            <div className="lg:col-span-2" ref={leftContainerRef}>
              <div className="border rounded-lg bg-card shadow-sm min-h-[600px] p-6">
                <TicketDetails
                  ticket={ticket}
                  onEditClick={() => setEditModalOpen(true)}
                  onTimerToggle={(updatedTicket) => {
                    setTicket(updatedTicket)
                  }}
                  showAdminInfo={true}
                />
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="lg:col-span-1" ref={rightContainerRef}>
              <div 
                ref={rightInnerContainerRef}
                className="border rounded-lg bg-card shadow-sm flex flex-col lg:sticky lg:top-6 overflow-hidden"
              >
                {/* Chat Header */}
                <div className="p-4 border-b border-border shrink-0">
                  <h2 className="text-lg font-semibold">
                    Comentários ({ticket.messages.length})
                  </h2>
                </div>

                {/* Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0 overscroll-contain">
                  <MessageList
                    messages={ticket.messages}
                    currentUserId={currentUser.id}
                  />
                </div>

                {/* Message Form - Fixed at Bottom */}
                <div className="p-4 border-t border-border shrink-0 bg-background">
                  <MessageForm
                    ticketId={ticketId}
                    currentUserId={currentUser.id}
                    currentUserName={currentUser.name}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {ticket && (
        <AdminTicketEditModal
          ticket={{
            id: ticket.id,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            unit: ticket.unit ?? null,
            assignee: ticket.assignee,
          }}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUpdate={fetchTicket}
        />
      )}
    </div>
  )
}

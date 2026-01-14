"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TicketDetails } from "@/components/features/tickets/shared/ticket-details"
import { MessageList } from "@/components/features/tickets/shared/message-list"
import { MessageForm } from "@/components/features/tickets/shared/message-form"
import { AdminTicketEditModal } from "@/components/features/tickets/admin/admin-ticket-edit-modal"
import { ArrowLeft, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
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
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const rightColumnRef = useRef<HTMLDivElement>(null)

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

      // Verificar se a resposta é JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Resposta não é JSON:", text.substring(0, 200))
        throw new Error("Resposta inválida do servidor")
      }

      const data = await res.json()

      // Debug: verificar se os campos de timer estão presentes
      if (data.ok && data.ticket) {
        console.log("Ticket carregado:", {
          id: data.ticket.id,
          timerPaused: data.ticket.timerPaused,
          timerPausedAt: data.ticket.timerPausedAt,
          totalPausedMinutes: data.ticket.totalPausedMinutes,
          inProgressAt: data.ticket.inProgressAt,
          status: data.ticket.status,
        })
      }

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

  // Sincronizar altura da coluna direita com a esquerda
  useEffect(() => {
    if (!leftColumnRef.current || !rightColumnRef.current) return

    const syncHeights = () => {
      if (leftColumnRef.current && rightColumnRef.current) {
        const leftHeight = leftColumnRef.current.offsetHeight
        rightColumnRef.current.style.height = `${leftHeight}px`
      }
    }

    // Sincronizar inicialmente
    syncHeights()

    // Observar mudanças no container da esquerda
    const resizeObserver = new ResizeObserver(syncHeights)
    resizeObserver.observe(leftColumnRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ticket])

  const handleMessageSent = (newMessage: any) => {
    // Re-fetch ticket para atualizar a lista de mensagens
    setTimeout(() => {
      fetchTicket()
    }, 500)
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Modern Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 sm:space-y-6 px-4 sm:px-0"
        >
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Ticket Details */}
            <div className="lg:col-span-2" ref={leftColumnRef}>
              <TicketDetails
                ticket={ticket}
                onEditClick={() => setEditModalOpen(true)}
                onTimerToggle={(updatedTicket) => {
                  setTicket(updatedTicket)
                }}
                showAdminInfo={true}
              />
            </div>

            {/* Right Column - Comments */}
            <div className="lg:col-span-1 flex flex-col h-full lg:sticky lg:top-4 lg:self-start" ref={rightColumnRef}>
              {/* Messages Section - Chat Style */}
              <div className="border rounded-xl sm:rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg flex flex-col flex-1 min-h-[400px] lg:min-h-0 lg:max-h-[calc(100vh-8rem)]">
                {/* Chat Header */}
                <div className="p-3 sm:p-4 md:p-6 border-b border-border/50 shrink-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                    Comentários ({ticket.messages.length})
                  </h2>
                </div>

                {/* Messages Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 min-h-0">
                  <MessageList
                    messages={ticket.messages}
                    currentUserId={currentUser.id}
                  />
                </div>

                {/* Message Form - Fixed at Bottom */}
                <div className="p-3 sm:p-4 md:p-6 border-t border-border/50 shrink-0 bg-card/80 backdrop-blur-sm">
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
        </motion.div>
      </div>
    </div>
  )
}

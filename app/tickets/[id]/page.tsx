"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TicketDetails } from "@/components/tickets/ticket-details"
import { MessageList } from "@/components/tickets/message-list"
import { MessageForm } from "@/components/tickets/message-form"
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

export default function TicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserName, setCurrentUserName] = useState<string>("")

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tickets/${ticketId}`, {
        cache: 'no-store',
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Ticket não encontrado")
          router.push("/tickets")
          return
        }
        throw new Error(data.error || "Erro ao buscar ticket")
      }

      setTicket(data.ticket)
      setCurrentUserId(data.ticket.openedBy.id)
      setCurrentUserName(data.ticket.openedBy.name)
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar ticket")
      router.push("/tickets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const handleMessageSent = (newMessage: {
    id: string
    content: string
    createdAt: string | Date
    author: {
      id: string
      name: string
      email: string
    }
  }) => {
    if (!ticket) return

    // Se for uma mensagem temporária (otimista), apenas adicionar
    if (newMessage.id.startsWith('temp-')) {
      setTicket({
        ...ticket,
        messages: [...ticket.messages, newMessage],
      })
    } else {
      // Se for a mensagem real, substituir a temporária ou adicionar
      const messageIndex = ticket.messages.findIndex(m => m.id.startsWith('temp-'))
      if (messageIndex !== -1) {
        // Substituir mensagem temporária pela real
        const updatedMessages = [...ticket.messages]
        updatedMessages[messageIndex] = newMessage
        setTicket({
          ...ticket,
          messages: updatedMessages,
        })
      } else {
        // Adicionar nova mensagem
        setTicket({
          ...ticket,
          messages: [...ticket.messages, newMessage],
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
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

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tickets")}
            className="hover:bg-accent/50"
          >
            <ArrowLeft className="size-4 mr-2" />
            Voltar para Meus Chamados
          </Button>

          {/* Main Content Container */}
          <div className="border rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg p-6 sm:p-8 lg:p-10">
            {/* Ticket Details */}
            <TicketDetails ticket={ticket} />

            {/* Messages Section */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <h2 className="text-xl font-semibold mb-6">
                Comentários ({ticket.messages.length})
              </h2>
              <div className="space-y-4">
                <MessageList
                  messages={ticket.messages}
                  currentUserId={currentUserId}
                />
                
                {/* Add Message Form */}
                <MessageForm 
                  ticketId={ticketId} 
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onMessageSent={handleMessageSent} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { 
  Clock, 
  User, 
  UserCheck, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle,
  Plus
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type TimelineEvent = {
  id: string
  type: "created" | "assigned" | "status_changed" | "message" | "attachment"
  timestamp: Date
  title: string
  description?: string
  user?: {
    name: string
    email: string
  }
  icon: any
  iconColor: string
}

type TicketTimelineProps = {
  ticket: {
    id: string
    createdAt: string | Date
    updatedAt: string | Date
    inProgressAt?: string | Date | null
    resolvedAt?: string | Date | null
    closedAt?: string | Date | null
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
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
      createdAt: string | Date
    }>
  }
}

const STATUS_LABELS = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em Andamento",
  RESOLVED: "Resolvido",
  CLOSED: "Fechado",
}

export function TicketTimeline({ ticket }: TicketTimelineProps) {
  const events: TimelineEvent[] = []

  // Evento: Criação do ticket
  events.push({
    id: "created",
    type: "created",
    timestamp: new Date(ticket.createdAt),
    title: "Ticket criado",
    description: `Criado por ${ticket.openedBy.name}`,
    user: ticket.openedBy,
    icon: Plus,
    iconColor: "text-blue-600 dark:text-blue-400",
  })

  // Evento: Atribuição (se houver)
  if (ticket.assignee) {
    // Usar inProgressAt se disponível, senão usar updatedAt como aproximação
    const assignedAt = ticket.inProgressAt 
      ? new Date(ticket.inProgressAt)
      : new Date(ticket.updatedAt)
    
    events.push({
      id: "assigned",
      type: "assigned",
      timestamp: assignedAt,
      title: "Ticket atribuído",
      description: `Atribuído a ${ticket.assignee.name}`,
      user: ticket.assignee,
      icon: UserCheck,
      iconColor: "text-green-600 dark:text-green-400",
    })
  }

  // Eventos: Mudanças de status
  if (ticket.inProgressAt && ticket.status !== "OPEN") {
    events.push({
      id: "status_in_progress",
      type: "status_changed",
      timestamp: new Date(ticket.inProgressAt),
      title: "Status alterado",
      description: `Alterado para ${STATUS_LABELS.IN_PROGRESS}`,
      icon: Loader2,
      iconColor: "text-yellow-600 dark:text-yellow-400",
    })
  }

  if (ticket.resolvedAt) {
    events.push({
      id: "status_resolved",
      type: "status_changed",
      timestamp: new Date(ticket.resolvedAt),
      title: "Status alterado",
      description: `Alterado para ${STATUS_LABELS.RESOLVED}`,
      icon: CheckCircle2,
      iconColor: "text-green-600 dark:text-green-400",
    })
  }

  if (ticket.closedAt) {
    events.push({
      id: "status_closed",
      type: "status_changed",
      timestamp: new Date(ticket.closedAt),
      title: "Status alterado",
      description: `Alterado para ${STATUS_LABELS.CLOSED}`,
      icon: XCircle,
      iconColor: "text-gray-600 dark:text-gray-400",
    })
  }

  // Eventos: Anexos (apenas os 3 mais recentes)
  const recentAttachments = ticket.attachments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  recentAttachments.forEach((attachment) => {
    events.push({
      id: `attachment-${attachment.id}`,
      type: "attachment",
      timestamp: new Date(attachment.createdAt),
      title: "Anexo adicionado",
      description: attachment.filename,
      icon: FileText,
      iconColor: "text-purple-600 dark:text-purple-400",
    })
  })

  // Eventos: Mensagens (apenas as 5 mais recentes)
  const recentMessages = ticket.messages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  recentMessages.forEach((message) => {
    const cleanContent = message.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim()
      .substring(0, 60)

    events.push({
      id: `message-${message.id}`,
      type: "message",
      timestamp: new Date(message.createdAt),
      title: "Comentário adicionado",
      description: cleanContent + (message.content.length > 60 ? "..." : ""),
      user: message.author,
      icon: MessageSquare,
      iconColor: "text-indigo-600 dark:text-indigo-400",
    })
  })

  // Ordenar eventos por timestamp (mais recente primeiro)
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Limitar a 10 eventos mais recentes
  const displayEvents = events.slice(0, 10)

  if (displayEvents.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {displayEvents.map((event, index) => {
        const EventIcon = event.icon
        const timeAgo = formatDistanceToNow(event.timestamp, {
          addSuffix: true,
          locale: ptBR,
        })
        const timeFormatted = format(event.timestamp, "dd/MM/yyyy 'às' HH:mm", {
          locale: ptBR,
        })

        const isLast = index === displayEvents.length - 1

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Linha vertical */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
            )}

            {/* Ícone do evento */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  "size-6 rounded-full bg-background border-2 border-border flex items-center justify-center",
                  event.iconColor
                )}
              >
                <EventIcon className={cn("size-3.5", event.iconColor)} />
              </div>
            </div>

            {/* Conteúdo do evento */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    {event.title}
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {event.description}
                    </div>
                  )}
                  {event.user && (
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <User className="size-3" />
                      <span>{event.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <Clock className="size-3" />
                <span title={timeFormatted}>{timeAgo}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

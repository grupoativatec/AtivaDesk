"use client"

import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MessageSquare, 
  Paperclip, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type TicketWithRelations = {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  createdAt: string | Date
  updatedAt: string | Date
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
  _count: {
    messages: number
    attachments: number
  }
}

interface TicketCardProps {
  ticket: TicketWithRelations
}

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400/80 dark:border-blue-900/30",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400/80 dark:border-yellow-900/30",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400/80 dark:border-green-900/30",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400/80 dark:border-gray-900/30",
    icon: XCircle,
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

export function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[ticket.status]
  const StatusIcon = statusConfig.icon

  const timeAgo = formatDistanceToNow(new Date(ticket.createdAt), {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div
      className={cn(
        "group relative border border-border dark:border-border/50 rounded-lg p-5 h-full hover:shadow-md dark:hover:shadow-none transition-all cursor-pointer",
        "bg-card dark:bg-card/50 hover:border-border/80 flex flex-col"
      )}
      onClick={() => router.push(`/tickets/${ticket.id}`)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {ticket.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {ticket.description
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .trim()
                .substring(0, 100)}
              {ticket.description.replace(/<[^>]*>/g, "").length > 100 && "..."}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium border px-2.5 py-0.5",
                statusConfig.color
              )}
            >
              <StatusIcon className="size-3 mr-1.5" />
              {statusConfig.label}
            </Badge>

            <Badge variant="outline" className="text-xs px-2.5 py-0.5 text-muted-foreground">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </Badge>
          </div>

          {/* Footer Info */}
          <div className="mt-auto pt-4 border-t border-border/50 dark:border-border/30">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>{timeAgo}</span>
              </div>

              {ticket._count.messages > 0 && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="size-3.5" />
                  <span>{ticket._count.messages}</span>
                </div>
              )}

              {ticket._count.attachments > 0 && (
                <div className="flex items-center gap-1.5">
                  <Paperclip className="size-3.5" />
                  <span>{ticket._count.attachments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

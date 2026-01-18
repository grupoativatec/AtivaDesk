"use client"

import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MessageSquare,
  Paperclip,
  AlertCircle,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type TicketWithRelations = {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  unit: string | null
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
  _count: {
    messages: number
    attachments: number
  }
}

interface AdminTicketCardProps {
  ticket: TicketWithRelations
  currentUserId: string
  onAssign?: () => void
}

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    badgeColor: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  },
  RESOLVED: {
    label: "Resolvido",
    badgeColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  CLOSED: {
    label: "Fechado",
    badgeColor: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
  },
  MEDIUM: {
    label: "Média",
  },
  HIGH: {
    label: "Alta",
  },
  URGENT: {
    label: "Urgente",
    badgeColor: "bg-red-50/80 text-red-600 border-red-200/60 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800/50",
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

const UNIT_LABELS: Record<string, string> = {
  ITJ: "ITJ",
  SFS: "SFS",
  FOZ: "FOZ",
  DIO: "DIO",
  AOL: "AOL",
}

export function AdminTicketCard({ ticket, currentUserId, onAssign }: AdminTicketCardProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]

  const timeAgo = formatDistanceToNow(new Date(ticket.createdAt), {
    addSuffix: true,
    locale: ptBR,
  })

  // Verificar se é ticket crítico (urgente + aberto há mais de 4 horas)
  const hoursSinceCreation = differenceInHours(new Date(), new Date(ticket.createdAt))
  const isCritical = ticket.priority === "URGENT" && ticket.status === "OPEN" && hoursSinceCreation >= 4

  // Limpar descrição HTML e limitar a 1 linha
  const cleanDescription = ticket.description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
    .substring(0, 100)

  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-lg p-4 h-full",
        "hover:border-border hover:shadow-md transition-all cursor-pointer",
        "flex flex-col",
        isCritical && "bg-red-50/30 dark:bg-red-950/10 border-red-200/50 dark:border-red-800/30"
      )}
      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
    >
      {/* Header: Título e Status */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {ticket.title}
              </h3>
              {isCritical && (
                <AlertTriangle className="size-4 text-red-500 shrink-0" />
              )}
            </div>
          </div>
          {/* Status como badge destacado */}
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold px-2.5 py-1 border shrink-0",
              statusConfig.badgeColor
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Descrição - 1 linha apenas */}
        <p className="text-xs text-muted-foreground line-clamp-1">
          {cleanDescription}
          {ticket.description.replace(/<[^>]*>/g, "").length > 100 && "..."}
        </p>
      </div>

      {/* Badges: Prioridade Urgente (saturada reduzida) e Categoria */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {ticket.priority === "URGENT" && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium px-2 py-0.5 border",
              priorityConfig.badgeColor
            )}
          >
            <AlertCircle className="size-3 mr-1" />
            Urgente
          </Badge>
        )}
        <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
          {CATEGORY_LABELS[ticket.category] || ticket.category}
        </Badge>
        {ticket.unit && (
          <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
            {UNIT_LABELS[ticket.unit] || ticket.unit}
          </Badge>
        )}
      </div>

      {/* Informações secundárias - discretas */}
      <div className="mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              <span>{timeAgo}</span>
            </div>
            {ticket._count.messages > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                <span>{ticket._count.messages}</span>
              </div>
            )}
            {ticket._count.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="size-3" />
                <span>{ticket._count.attachments}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Responsável */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <UserCheck className="size-3 shrink-0" />
          <span className="truncate">
            {ticket.assignee ? ticket.assignee.name : "Responsável não definido"}
          </span>
        </div>
      </div>
    </div>
  )
}

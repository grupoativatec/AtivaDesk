"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  MessageSquare,
  Paperclip,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  UserCheck
} from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"

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
  gradientIndex?: number
  currentUserId: string
  onAssign?: () => void
}

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    icon: XCircle,
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  URGENT: {
    label: "Urgente",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
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

export function AdminTicketCard({ ticket, gradientIndex = 0, currentUserId, onAssign }: AdminTicketCardProps) {
  const router = useRouter()
  const [isAssigning, setIsAssigning] = useState(false)
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const StatusIcon = statusConfig.icon

  const lastMessage = ticket.messages[ticket.messages.length - 1]
  const timeAgo = formatDistanceToNow(new Date(ticket.createdAt), {
    addSuffix: true,
    locale: ptBR,
  })

  const isAssignedToMe = ticket.assignee?.id === currentUserId
  const isUnassigned = !ticket.assignee

  // Gradientes diferentes para cada ticket
  const gradients = [
    "bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10",
    "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10",
    "bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10",
    "bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10",
    "bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-fuchsia-500/10",
    "bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10",
    "bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-lime-500/10",
    "bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10",
    "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10",
  ]
  const gradient = gradients[gradientIndex % gradients.length]

  const handleAssign = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isAssignedToMe) {
      router.push(`/admin/tickets/${ticket.id}`)
      return
    }

    try {
      setIsAssigning(true)
      const res = await fetch(`/api/admin/tickets/${ticket.id}/assign`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao assumir ticket")
      }

      toast.success("Ticket assumido com sucesso!")
      if (onAssign) {
        onAssign()
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao assumir ticket")
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div
      className={cn(
        "group relative border rounded-xl p-5 h-full hover:shadow-lg transition-all cursor-pointer",
        "backdrop-blur-sm border-border/50 hover:border-border",
        "hover:scale-[1.02] flex flex-col",
        gradient
      )}
      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
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

            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium px-2.5 py-0.5",
                priorityConfig.color
              )}
            >
              {priorityConfig.label}
            </Badge>

            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              {CATEGORY_LABELS[ticket.category] || ticket.category}
            </Badge>

            {ticket.unit && (
              <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                {UNIT_LABELS[ticket.unit] || ticket.unit}
              </Badge>
            )}
          </div>

          {/* User Info */}
          <div className="mb-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 mb-1">
              <User className="size-3.5" />
              <span>Criado por: <span className="font-medium text-foreground">{ticket.openedBy.name}</span></span>
            </div>
            {ticket.assignee && (
              <div className="flex items-center gap-1.5">
                <UserCheck className="size-3.5" />
                <span>Responsável: <span className="font-medium text-foreground">{ticket.assignee.name}</span></span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-auto pt-4 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
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

            {/* Assign Button */}
            <div className="flex items-center justify-between mt-3">
              <Button
                size="sm"
                variant={isAssignedToMe ? "default" : "outline"}
                onClick={handleAssign}
                disabled={isAssigning}
                className="text-xs"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Assumindo...
                  </>
                ) : isAssignedToMe ? (
                  <>
                    <UserCheck className="size-3 mr-1.5" />
                    Meu ticket
                  </>
                ) : (
                  <>
                    <UserCheck className="size-3 mr-1.5" />
                    Assumir ticket
                  </>
                )}
              </Button>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

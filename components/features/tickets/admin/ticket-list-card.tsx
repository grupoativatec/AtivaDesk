"use client"

import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  User,
  UserCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Monitor,
  Code,
  Network,
  Mail,
  Lock,
  FileText
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type TicketWithRelations = {
  id: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  createdAt: string
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
}

interface TicketListCardProps {
  ticket: TicketWithRelations
}

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400/80 dark:border-blue-900/30",
    icon: AlertTriangle,
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
    label: "Crítica",
  },
} as const

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  HARDWARE: {
    label: "Hardware",
    icon: Monitor,
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
  },
  SOFTWARE: {
    label: "Software",
    icon: Code,
    color: "bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
  },
  NETWORK: {
    label: "Rede",
    icon: Network,
    color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
  },
  EMAIL: {
    label: "E-mail",
    icon: Mail,
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800",
  },
  ACCESS: {
    label: "Acesso",
    icon: Lock,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800",
  },
  OTHER: {
    label: "Outro",
    icon: FileText,
    color: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800",
  },
}

export function TicketListCard({ ticket }: TicketListCardProps) {
  const router = useRouter()
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const categoryConfig = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.OTHER
  const CategoryIcon = categoryConfig.icon
  const StatusIcon = statusConfig.icon

  const createdDate = new Date(ticket.createdAt)
  const dateFormatted = format(createdDate, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })

  // Limpar descrição HTML
  const cleanDescription = ticket.description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

  // Formatar ID do ticket (usar últimos 8 caracteres)
  const ticketNumber = `${ticket.id.slice(-8).toUpperCase()}`

  // Extrair primeiro nome do responsável ou mostrar "Responsável não atribuído"
  const getResponsibleName = () => {
    if (!ticket.assignee) {
      return "Sem responsável"
    }
    // Pegar apenas o primeiro nome
    const firstName = ticket.assignee.name.split(" ")[0]
    return firstName
  }

  return (
    <div
      className="bg-card dark:bg-card/50 border border-border dark:border-border/50 rounded-lg p-5 sm:p-6 hover:shadow-md dark:hover:shadow-none transition-all cursor-pointer h-full flex flex-col min-w-0"
      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
    >
      {/* Header: ID, Categoria e Prioridade */}
      <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap shrink-0">
            #{ticketNumber}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 shrink-0", categoryConfig.color)}
          >
            <CategoryIcon className="size-3 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">{categoryConfig.label}</span>
            <span className="sm:hidden">{categoryConfig.label.substring(0, 3)}</span>
          </Badge>
        </div>
        {ticket.priority === "URGENT" && (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400/80 dark:border-red-900/30 text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 shrink-0"
          >
            <AlertTriangle className="size-3 mr-1" />
            <span className="hidden sm:inline">{priorityConfig.label}</span>
            <span className="sm:hidden">Urg</span>
          </Badge>
        )}
      </div>

      {/* Título */}
      <h3 className="font-bold text-sm sm:text-base text-foreground mb-2 line-clamp-2 min-w-0">
        {ticket.title}
      </h3>

      {/* Descrição */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 flex-1 min-w-0">
        {cleanDescription}
      </p>

      {/* Footer: Responsável, Data e Status */}
      <div className="pt-3 border-t border-border/50 dark:border-border/30">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-0">
            <UserCheck className="size-3 shrink-0" />
            <span className={cn(
              "truncate max-w-[120px]",
              !ticket.assignee && "italic"
            )}>
              {getResponsibleName()}
            </span>
            <span className="shrink-0 mx-0.5">•</span>
            <div className="flex items-center gap-1.5 min-w-0 shrink-0">
              <Calendar className="size-3 shrink-0" />
              <span className="whitespace-nowrap">{dateFormatted}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-xs font-medium px-2 py-0.5 shrink-0", statusConfig.color)}
          >
            <StatusIcon className="size-3 mr-1 shrink-0" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}

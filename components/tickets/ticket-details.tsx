"use client"

import {
  User,
  Paperclip,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
   
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
  
  },
  CLOSED: {
    label: "Fechado",
  
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

type TicketDetailsProps = {
  ticket: {
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
    attachments: Array<{
      id: string
      filename: string
      url: string
      mimeType: string
      size: number
      createdAt: string | Date
    }>
  }
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]

  const createdDate = new Date(ticket.createdAt)
  const updatedDate = new Date(ticket.updatedAt)
  const timeAgo = formatDistanceToNow(createdDate, {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div className="border rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {ticket.title}
        </h1>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 pb-6 border-b border-border/50">
        <div className="flex flex-col text-sm">
          <span className="text-muted-foreground text-xs mb-1">Status</span>
          <span className="font-medium">
            {statusConfig.label}
          </span>
        </div>

        <div className="flex flex-col text-sm">
          <span className="text-muted-foreground text-xs mb-1">Prioridade</span>
          <span className="font-medium">
            {priorityConfig.label}
          </span>
        </div>

        <div className="flex flex-col text-sm">
          <span className="text-muted-foreground text-xs mb-1">Categoria</span>
          <span className="font-medium">
            {CATEGORY_LABELS[ticket.category] || ticket.category}
          </span>
        </div>

        {ticket.unit && (
          <div className="flex flex-col text-sm">
            <span className="text-muted-foreground text-xs mb-1">Unidade</span>
            <span className="font-medium">
              {UNIT_LABELS[ticket.unit] || ticket.unit}
            </span>
          </div>
        )}

        <div className="flex flex-col text-sm">
          <span className="text-muted-foreground text-xs mb-1">Criado</span>
          <span className="font-medium">{format(createdDate, "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>
      </div>

      {/* Additional Info */}
      {(ticket.assignee || ticket.openedBy) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 ">
          {ticket.assignee && (
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">Atribuído a</span>
                <span className="font-medium">{ticket.assignee.name}</span>
              </div>
            </div>
          )}          
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Descrição do Problema</h2>
        <div
          className="[&_p]:my-2 [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:space-y-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3 [&_img]:border [&_img]:border-border text-sm"
          dangerouslySetInnerHTML={{ __html: ticket.description }}
        />
      </div>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div className="pt-6 border-t border-border/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Paperclip className="size-4" />
            Anexos ({ticket.attachments.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ticket.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border rounded-lg p-3 hover:bg-accent/50 hover:border-border transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Paperclip className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs font-medium truncate flex-1">
                    {attachment.filename}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {attachment.size > 0
                      ? `${(attachment.size / 1024).toFixed(1)} KB`
                      : "—"}
                  </span>
                  <Download className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

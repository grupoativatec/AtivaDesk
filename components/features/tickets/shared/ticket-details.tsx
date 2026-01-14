"use client"

import {
  User,
  Paperclip,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Pencil,
  Clock,
  Pause,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

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
    attachments: Array<{
      id: string
      filename: string
      url: string
      mimeType: string
      size: number
      createdAt: string | Date
    }>
  }
  onEditClick?: () => void
  onTimerToggle?: (ticket: any) => void
  showAdminInfo?: boolean // Controla se mostra informações de admin (atribuído a, tempo dedicado)
}

export function TicketDetails({ ticket, onEditClick, onTimerToggle, showAdminInfo = false }: TicketDetailsProps) {
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const [isPaused, setIsPaused] = useState<boolean>(ticket.timerPaused ?? false)
  const [isToggling, setIsToggling] = useState<boolean>(false)

  const createdDate = new Date(ticket.createdAt)
  const updatedDate = new Date(ticket.updatedAt)
  const timeAgo = formatDistanceToNow(createdDate, {
    addSuffix: true,
    locale: ptBR,
  })

  // Sincronizar estado de pausa com o ticket (deve ser executado primeiro)
  useEffect(() => {
    setIsPaused(ticket.timerPaused ?? false)
  }, [ticket.timerPaused])

  // Timer minimalista
  useEffect(() => {
    // Se o ticket está resolvido/fechado, mostrar tempo total
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
      if (ticket.timeSpentMinutes !== null && ticket.timeSpentMinutes !== undefined) {
        const hours = Math.floor(ticket.timeSpentMinutes / 60)
        const minutes = ticket.timeSpentMinutes % 60
        if (hours > 0) {
          setElapsedTime(`${hours}h ${minutes}min`)
        } else {
          setElapsedTime(`${minutes}min`)
        }
      } else {
        setElapsedTime("")
      }
      return
    }

    // Se está em andamento, calcular tempo em tempo real
    if (ticket.status === "IN_PROGRESS" && ticket.inProgressAt) {
      const updateTimer = () => {
        const startTime = new Date(ticket.inProgressAt!)
        const now = new Date()
        const diffMs = now.getTime() - startTime.getTime()
        let diffSeconds = Math.floor(diffMs / 1000)

        // Subtrair o tempo total pausado acumulado (em segundos)
        const totalPausedSeconds = ticket.totalPausedSeconds ?? 0
        diffSeconds -= totalPausedSeconds

        // Se está pausado no momento, subtrair o tempo desde que foi pausado
        const isCurrentlyPaused = ticket.timerPaused ?? false
        if (isCurrentlyPaused && ticket.timerPausedAt) {
          const pausedAt = new Date(ticket.timerPausedAt)
          const pausedMs = now.getTime() - pausedAt.getTime()
          const currentPausedSeconds = Math.floor(pausedMs / 1000)
          diffSeconds -= currentPausedSeconds
        }

        // Garantir que não seja negativo
        diffSeconds = Math.max(0, diffSeconds)

        // Converter para minutos e horas para exibição
        const diffMinutes = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMinutes / 60)
        const remainingMinutes = diffMinutes % 60
        const remainingSeconds = diffSeconds % 60

        if (diffHours > 0) {
          setElapsedTime(`${diffHours}h ${remainingMinutes}min`)
        } else if (diffMinutes > 0) {
          setElapsedTime(`${diffMinutes}min ${remainingSeconds}s`)
        } else {
          setElapsedTime(`${diffSeconds}s`)
        }
      }

      updateTimer()
      // Usar ticket.timerPaused diretamente para controlar o intervalo
      const isCurrentlyPaused = ticket.timerPaused ?? false
      if (!isCurrentlyPaused) {
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
      } else {
        // Se estiver pausado, atualizar apenas uma vez para mostrar o tempo congelado
        return
      }
    }

    setElapsedTime("")
  }, [ticket.inProgressAt, ticket.timeSpentMinutes, ticket.status, ticket.timerPaused, ticket.timerPausedAt, ticket.totalPausedSeconds, isPaused])

  const handleTimerToggle = async () => {
    if (!onTimerToggle || ticket.status !== "IN_PROGRESS") return

    setIsToggling(true)
    try {
      const action = isPaused ? "resume" : "pause"
      const res = await fetch(`/api/admin/tickets/${ticket.id}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro desconhecido" }))
        console.error("Erro ao pausar/retomar timer:", data.error)
        return
      }

      const data = await res.json()
      if (data.ok && data.ticket) {
        // Atualizar o estado local imediatamente
        setIsPaused(data.ticket.timerPaused ?? false)
        // Atualizar o ticket completo para forçar recálculo
        if (onTimerToggle) {
          onTimerToggle(data.ticket)
        }
      }
    } catch (error) {
      console.error("Erro ao pausar/retomar timer:", error)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="border rounded-xl sm:rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex-1">
            {ticket.title}
          </h1>
          {onEditClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEditClick}
              className="shrink-0 w-full sm:w-auto"
            >
              <Pencil className="size-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border/50">
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

        {showAdminInfo && ticket.assignee && (
          <div className="flex flex-col text-sm">
            <span className="text-muted-foreground text-xs mb-1">Responsável</span>
            <span className="font-medium">{ticket.assignee.name}</span>
          </div>
        )}

        {showAdminInfo && elapsedTime && (
          <div className="flex flex-col text-sm">
            <span className="text-muted-foreground text-xs mb-1">Tempo dedicado</span>
            <div className="flex items-center gap-2 flex-nowrap">
              <span className={cn(
                "font-medium flex items-center gap-1 whitespace-nowrap",
                ticket.status === "IN_PROGRESS" && !isPaused && "text-primary"
              )}>
                <Clock className={cn(
                  "size-4 shrink-0",
                  ticket.status === "IN_PROGRESS" && !isPaused && "animate-pulse"
                )} />
                <span className="whitespace-nowrap">{elapsedTime}</span>
              </span>
              {ticket.status === "IN_PROGRESS" && onTimerToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTimerToggle}
                  disabled={isToggling}
                  className="h-6 w-6 p-0 shrink-0 flex-shrink-0"
                  title={isPaused ? "Retomar timer" : "Pausar timer"}
                >
                  {isPaused ? (
                    <Play className="size-3" />
                  ) : (
                    <Pause className="size-3" />
                  )}
                </Button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Descrição do Problema</h2>
        <div
          className="[&_p]:my-2 [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ml-4 sm:[&_ul]:ml-6 [&_ul]:space-y-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ml-4 sm:[&_ol]:ml-6 [&_ol]:space-y-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3 [&_img]:border [&_img]:border-border text-xs sm:text-sm"
          dangerouslySetInnerHTML={{ __html: ticket.description }}
        />
      </div>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div className="pt-4 sm:pt-6 border-t border-border/50">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Paperclip className="size-4" />
            Anexos ({ticket.attachments.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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

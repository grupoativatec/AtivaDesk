"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageList } from "@/components/features/tickets/shared/message-list"
import { MessageForm } from "@/components/features/tickets/shared/message-form"
import { AdminTicketEditModal } from "@/components/features/tickets/admin/admin-ticket-edit-modal"
import {
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  UserCheck,
  MessageSquare,
  Settings,
  Monitor,
  Code,
  Network,
  Mail,
  Lock,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Pause,
  Play,
  Paperclip,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

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

const STATUS_CONFIG = {
  OPEN: {
    label: "Aberto",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: CheckCircle2,
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: CheckCircle2,
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: Clock,
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: AlertTriangle,
  },
  URGENT: {
    label: "Crítica",
    color: "bg-red-50 text-red-600 border-red-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
    icon: AlertTriangle,
  },
} as const

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  HARDWARE: {
    label: "Hardware",
    icon: Monitor,
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
  SOFTWARE: {
    label: "Software",
    icon: Code,
    color: "bg-green-50 text-green-600 border-green-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
  NETWORK: {
    label: "Rede",
    icon: Network,
    color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
  EMAIL: {
    label: "E-mail",
    icon: Mail,
    color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
  ACCESS: {
    label: "Acesso",
    icon: Lock,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
  OTHER: {
    label: "Outro",
    icon: FileText,
    color: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border/30",
  },
}

export default function AdminTicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [isToggling, setIsToggling] = useState<boolean>(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

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

  const handleAssign = async () => {
    if (!ticket) return

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
      fetchTicket()
    } catch (error: any) {
      toast.error(error.message || "Erro ao assumir ticket")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleTimerStart = async () => {
    if (!ticket || ticket.status !== "IN_PROGRESS") return

    setIsToggling(true)
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/timer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erro desconhecido" }))
        toast.error(data.error || "Erro ao iniciar timer")
        return
      }

      const data = await res.json()
      if (data.ok && data.ticket) {
        setIsPaused(data.ticket.timerPaused ?? false)
        setTicket(data.ticket)
        toast.success("Timer iniciado")
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar timer")
    } finally {
      setIsToggling(false)
    }
  }

  const handleTimerToggle = async () => {
    if (!ticket || ticket.status !== "IN_PROGRESS") return

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
        toast.error(data.error || "Erro ao pausar/retomar timer")
        return
      }

      const data = await res.json()
      if (data.ok && data.ticket) {
        setIsPaused(data.ticket.timerPaused ?? false)
        setTicket(data.ticket)
        toast.success(isPaused ? "Timer retomado" : "Timer pausado")
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao pausar/retomar timer")
    } finally {
      setIsToggling(false)
    }
  }

  // Sincronizar estado de pausa com o ticket
  useEffect(() => {
    if (ticket) {
      setIsPaused(ticket.timerPaused ?? false)
    }
  }, [ticket?.timerPaused])

  // Calcular tempo decorrido
  useEffect(() => {
    if (!ticket) {
      setElapsedTime("")
      return
    }

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
  }, [ticket?.inProgressAt, ticket?.timeSpentMinutes, ticket?.status, ticket?.timerPaused, ticket?.timerPausedAt, ticket?.totalPausedSeconds, isPaused])

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (ticketId && currentUser) {
      fetchTicket()
    }
  }, [ticketId, currentUser])

  const handleMessageSent = (newMessage: any) => {
    if (ticket && newMessage) {
      const messageExists = ticket.messages.some(m => m.id === newMessage.id)

      if (!messageExists) {
        setTicket({
          ...ticket,
          messages: [...ticket.messages, newMessage],
        })
      }
    }
  }

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (messagesContainerRef.current && ticket?.messages.length) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 150)

      return () => clearTimeout(timeoutId)
    }
  }, [ticket?.messages])

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const categoryConfig = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.OTHER
  const CategoryIcon = categoryConfig.icon
  const StatusIcon = statusConfig.icon
  const PriorityIcon = priorityConfig.icon

  const createdDate = new Date(ticket.createdAt)
  const dateFormatted = format(createdDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  const ticketNumber = `${ticket.id.slice(-8).toUpperCase()}`

  const isAssignedToMe = ticket.assignee?.id === currentUser.id
  const isUnassigned = !ticket.assignee

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header Fixo */}
      <div className="border-b border-border/50 dark:border-border/20 bg-card dark:bg-background/50 shrink-0">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
          {/* Mobile: Layout Simplificado */}
          <div className="sm:hidden space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/tickets")}
                    className="h-6 w-6 p-0 -ml-1"
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {ticketNumber}
                  </span>
                </div>
                <h1 className="text-base font-semibold text-foreground line-clamp-2 leading-tight">
                  {ticket.title}
                </h1>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isUnassigned && (
                  <Button
                    onClick={handleAssign}
                    disabled={isAssigning}
                    size="sm"
                    className="h-7 px-2 text-xs"
                  >
                    {isAssigning ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="size-3.5" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="h-7 w-7 p-0"
                >
                  <Settings className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium px-1.5 py-0.5", statusConfig.color)}
              >
                <StatusIcon className="size-2.5 mr-1 shrink-0" />
                {statusConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium px-1.5 py-0.5", priorityConfig.color)}
              >
                <PriorityIcon className="size-2.5 mr-1 shrink-0" />
                {priorityConfig.label}
              </Badge>
            </div>
          </div>

          {/* Desktop: Layout Minimalista */}
          <div className="hidden sm:block">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/tickets")}
                    className="h-7 w-7 p-0 -ml-1"
                  >
                    <ArrowLeft className="size-3.5" />
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {ticketNumber}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    {ticket.openedBy.name.split(' ')[0]}
                  </span>
                </div>
                <h1 className="text-xl lg:text-2xl font-semibold text-foreground mb-3 leading-tight">
                  {ticket.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium px-2 py-0.5", statusConfig.color)}
                  >
                    <StatusIcon className="size-3 mr-1 shrink-0" />
                    {statusConfig.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium px-2 py-0.5", priorityConfig.color)}
                  >
                    <PriorityIcon className="size-3 mr-1 shrink-0" />
                    {priorityConfig.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-xs font-medium px-2 py-0.5", categoryConfig.color)}
                  >
                    <CategoryIcon className="size-3 mr-1 shrink-0" />
                    {categoryConfig.label}
                  </Badge>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isUnassigned ? (
                  <Button
                    onClick={handleAssign}
                    disabled={isAssigning}
                    size="sm"
                    className="h-8 px-3 text-xs"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                        Assumindo...
                      </>
                    ) : (
                      <>
                        <UserCheck className="size-3.5 mr-1.5" />
                        Assumir
                      </>
                    )}
                  </Button>
                ) : (
                  !isAssignedToMe && (
                    <Button
                      onClick={handleAssign}
                      disabled={isAssigning}
                      size="sm"
                      className="h-8 px-3 text-xs"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                          Assumindo...
                        </>
                      ) : (
                        <>
                          <UserCheck className="size-3.5 mr-1.5" />
                          Assumir
                        </>
                      )}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Informações Adicionais - Minimalista */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-border/30 dark:border-border/10 text-xs text-muted-foreground">
              {ticket.assignee && (
                <div className="flex items-center gap-1.5">
                  <UserCheck className="size-3" />
                  <span>{ticket.assignee.name.split(' ')[0]}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                <span>{format(createdDate, "dd MMM yyyy", { locale: ptBR })}</span>
              </div>
              {ticket.status === "IN_PROGRESS" && ticket.inProgressAt && (
                <div className={cn(
                  "flex items-center gap-1.5 font-medium",
                  !isPaused && "text-primary"
                )}>
                  <Clock className={cn("size-3", !isPaused && "animate-pulse")} />
                  <span>{elapsedTime || "0s"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTimerToggle}
                    disabled={isToggling}
                    className="h-6 w-6 p-0 ml-1"
                  >
                    {isToggling ? (
                      <Loader2 className="size-2.5 animate-spin" />
                    ) : isPaused ? (
                      <Play className="size-2.5" />
                    ) : (
                      <Pause className="size-2.5" />
                    )}
                  </Button>
                </div>
              )}
              {!ticket.inProgressAt && ticket.status === "IN_PROGRESS" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTimerStart}
                  disabled={isToggling}
                  className="h-6 text-xs px-2"
                >
                  {isToggling ? (
                    <>
                      <Loader2 className="size-2.5 mr-1 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="size-2.5 mr-1" />
                      Iniciar
                    </>
                  )}
                </Button>
              )}
              {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && elapsedTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  <span>{elapsedTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Scroll único */}
      <div className="flex-1 overflow-y-auto bg-muted/20 dark:bg-background">
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 max-w-[1800px] mx-auto w-full">
          {/* Anexos - Sempre no topo */}
          {ticket.attachments.length > 0 && (
            <div className="bg-card dark:bg-card/40 border border-border/50 dark:border-border/20 rounded-lg p-3 sm:p-4 lg:p-6 mb-2 sm:mb-3 lg:mb-4 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-border/50 dark:border-border/20">
                <div className="size-7 sm:size-8 lg:size-10 rounded-lg bg-primary/10 dark:bg-muted/50 flex items-center justify-center">
                  <Paperclip className="size-3.5 sm:size-4 lg:size-5 text-primary dark:text-muted-foreground" />
                </div>
                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                  Anexos ({ticket.attachments.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ticket.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 border border-border/50 dark:border-border/20 rounded-lg hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors"
                  >
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        {attachment.filename}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {attachment.size > 0
                          ? `${(attachment.size / 1024).toFixed(1)} KB`
                          : "—"}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Grid: Descrição e Comentários lado a lado em telas grandes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 lg:gap-4 xl:gap-6 xl:items-stretch">
            {/* Descrição - Lado esquerdo */}
            <div className="bg-card dark:bg-card/40 border border-border/50 dark:border-border/20 rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm dark:shadow-none flex flex-col xl:max-h-[calc(100vh-12rem)] xl:overflow-hidden">
              <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-border/50 dark:border-border/20 shrink-0">
                <div className="size-7 sm:size-8 lg:size-10 rounded-lg bg-blue-100 dark:bg-muted/50 flex items-center justify-center">
                  <FileText className="size-3.5 sm:size-4 lg:size-5 text-blue-600 dark:text-muted-foreground" />
                </div>
                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                  Descrição
                </h2>
              </div>
              <div
                className="text-xs sm:text-sm text-foreground/90 leading-relaxed overflow-y-auto flex-1 min-h-0 [&_p]:my-1.5 sm:[&_p]:my-2 [&_p]:leading-relaxed [&_ul]:my-1.5 sm:[&_ul]:my-2 [&_ul]:list-disc [&_ul]:ml-3 sm:[&_ul]:ml-4 [&_ul]:space-y-0.5 sm:[&_ul]:space-y-1 [&_ol]:my-1.5 sm:[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ml-3 sm:[&_ol]:ml-4 [&_ol]:space-y-0.5 sm:[&_ol]:space-y-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80 [&_img]:max-w-full [&_img]:max-h-[300px] sm:[&_img]:max-h-[350px] lg:[&_img]:max-h-[400px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:rounded-lg [&_img]:my-1.5 sm:[&_img]:my-2 [&_img]:border [&_img]:border-border [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_video]:max-w-full [&_video]:max-h-[300px] sm:[&_video]:max-h-[350px] lg:[&_video]:max-h-[400px] [&_video]:w-auto [&_video]:h-auto [&_video]:rounded-lg [&_video]:my-1.5 sm:[&_video]:my-2 [&_video]:border [&_video]:border-border"
                dangerouslySetInnerHTML={{ __html: ticket.description }}
              />
            </div>

            {/* Mensagens - Layout tipo Chat - Lado direito */}
            <div 
              className="bg-card dark:bg-card/40 border border-border/50 dark:border-border/20 rounded-lg shadow-sm dark:shadow-none flex flex-col xl:h-full"
            >
              <div className="p-2.5 sm:p-3 lg:p-4 border-b border-border/50 dark:border-border/20 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-6 sm:size-7 lg:size-8 rounded-lg bg-green-100 dark:bg-muted/50 flex items-center justify-center">
                    <MessageSquare className="size-3 sm:size-3.5 lg:size-4 text-green-600 dark:text-muted-foreground" />
                  </div>
                  <h2 className="text-xs sm:text-sm lg:text-base font-bold text-foreground">
                    Comentários ({ticket.messages.length})
                  </h2>
                </div>
              </div>

              <div
                ref={messagesContainerRef}
                className={cn(
                  "overflow-y-auto p-2.5 sm:p-3 lg:p-4 space-y-2 bg-muted/10 dark:bg-background flex-1 min-h-0"
                )}
              >
                <MessageList
                  messages={ticket.messages}
                  currentUserId={currentUser.id}
                />
              </div>

              <div className="p-2.5 sm:p-3 lg:p-4 border-t border-border/50 dark:border-border/20 shrink-0 bg-muted/20 dark:bg-muted/30">
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

      {/* Edit Modal */}
      {ticket ? (
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
      ) : null}

    </div>
  )
}

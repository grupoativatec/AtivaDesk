"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageList } from "@/components/features/tickets/shared/message-list"
import { MessageForm } from "@/components/features/tickets/shared/message-form"
import { TicketTimeline } from "@/components/features/tickets/shared/ticket-timeline"
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
  Play
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
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "Em Andamento",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    icon: Loader2,
  },
  RESOLVED: {
    label: "Resolvido",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Fechado",
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
    icon: CheckCircle2,
  },
} as const

const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    icon: CheckCircle2,
  },
  MEDIUM: {
    label: "Média",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
    icon: Clock,
  },
  HIGH: {
    label: "Alta",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    icon: AlertTriangle,
  },
  URGENT: {
    label: "Crítica",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    icon: AlertTriangle,
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
      <div className="flex items-center justify-center h-full">
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
  const ticketNumber = `TKT-${ticket.id.slice(-8).toUpperCase()}`

  const isAssignedToMe = ticket.assignee?.id === currentUser.id
  const isUnassigned = !ticket.assignee

  // Limpar descrição HTML
  const cleanDescription = ticket.description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Informações do Ticket */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card Principal - Informações do Ticket */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                {/* Header: Botão Voltar, ID, Categoria e Badges */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/admin/tickets")}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <ArrowLeft className="size-4 mr-2" />
                      Voltar
                    </Button>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                      #{ticketNumber}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium px-3 py-1.5 shrink-0", categoryConfig.color)}
                    >
                      <CategoryIcon className="size-3.5 mr-1.5" />
                      {categoryConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium px-3 py-1.5", priorityConfig.color)}
                    >
                      <PriorityIcon className="size-3 mr-1.5" />
                      {priorityConfig.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-medium px-3 py-1.5", statusConfig.color)}
                    >
                      <StatusIcon className="size-3 mr-1.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-4">
                  {ticket.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Aberto em {dateFormatted}</span>
                  </div>
                  
                  {/* Timer - Mostrar para tickets em andamento, resolvidos ou fechados */}
                  {ticket.status === "IN_PROGRESS" && (
                    <div className="flex items-center gap-2">
                      {!ticket.inProgressAt ? (
                        // Timer não iniciado - mostrar botão para iniciar
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTimerStart}
                          disabled={isToggling}
                          className="h-8 px-3 shrink-0"
                          title="Iniciar timer"
                        >
                          {isToggling ? (
                            <>
                              <Loader2 className="size-3.5 mr-2 animate-spin" />
                              Iniciando...
                            </>
                          ) : (
                            <>
                              <Play className="size-3.5 mr-2" />
                              Iniciar Timer
                            </>
                          )}
                        </Button>
                      ) : (
                        // Timer iniciado - mostrar tempo e botão de pausar/retomar
                        <>
                          <div className={cn(
                            "flex items-center gap-2 text-sm font-medium",
                            !isPaused && "text-primary"
                          )}>
                            <Clock className={cn(
                              "size-4",
                              !isPaused && "animate-pulse"
                            )} />
                            <span>Tempo dedicado: {elapsedTime || "0s"}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTimerToggle}
                            disabled={isToggling}
                            className="h-8 px-3 shrink-0"
                            title={isPaused ? "Retomar timer" : "Pausar timer"}
                          >
                            {isToggling ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : isPaused ? (
                              <Play className="size-3.5" />
                            ) : (
                              <Pause className="size-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Timer para tickets resolvidos ou fechados */}
                  {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && elapsedTime && (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="size-4" />
                      <span>Tempo dedicado: {elapsedTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Descrição */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Descrição
                </h2>
                <div
                  className="text-sm text-muted-foreground leading-relaxed [&_p]:my-2 [&_p]:leading-relaxed [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:space-y-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:space-y-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80"
                  dangerouslySetInnerHTML={{ __html: ticket.description }}
                />
              </div>

              {/* Card de Anexos (se houver) */}
              {ticket.attachments.length > 0 && (
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="size-5" />
                    Anexos ({ticket.attachments.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ticket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="size-5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {attachment.filename}
                          </div>
                          <div className="text-xs text-muted-foreground">
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

              {/* Card de Comentários */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Comentários ({ticket.messages.length})
                  </h2>
                </div>

                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 min-h-[300px] max-h-[500px]"
                >
                  <MessageList
                    messages={ticket.messages}
                    currentUserId={currentUser.id}
                  />
                </div>

                <div className="p-6 border-t border-border bg-muted/30">
                  <MessageForm
                    ticketId={ticketId}
                    currentUserId={currentUser.id}
                    currentUserName={currentUser.name}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              </div>
            </div>

            {/* Coluna Direita - Ações, Responsável e Solicitante */}
            <div className="lg:col-span-1 space-y-6">
              {/* Card de Ações - Primeiro */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Ações
                </h2>
                <div className="space-y-3">
                  {isUnassigned ? (
                    <Button
                      onClick={handleAssign}
                      disabled={isAssigning}
                      className="w-full"
                      size="lg"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Assumindo...
                        </>
                      ) : (
                        <>
                          <UserCheck className="size-4 mr-2" />
                          Assumir Chamado
                        </>
                      )}
                    </Button>
                  ) : (
                    !isAssignedToMe && (
                      <Button
                        onClick={handleAssign}
                        disabled={isAssigning}
                        className="w-full"
                        size="lg"
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Assumindo...
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-4 mr-2" />
                            Assumir Chamado
                          </>
                        )}
                      </Button>
                    )
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      // Scroll para área de comentários
                      messagesContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
                      // Focar no input de mensagem após um pequeno delay
                      setTimeout(() => {
                        const messageInput = document.querySelector('textarea, [contenteditable="true"]') as HTMLElement
                        messageInput?.focus()
                      }, 500)
                    }}
                  >
                    <MessageSquare className="size-4 mr-2" />
                    Responder
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Settings className="size-4 mr-2" />
                    Alterar Status
                  </Button>
                </div>
              </div>

              {/* Card do Responsável (se atribuído) - Segundo */}
              {ticket.assignee && (
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Responsável
                  </h2>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserCheck className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground mb-1">
                        {ticket.assignee.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {ticket.assignee.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Card do Solicitante - Terceiro */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Solicitante
                </h2>
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground mb-1">
                      {ticket.openedBy.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {ticket.openedBy.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Timeline */}
              <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Atividades Recentes
                </h2>
                <TicketTimeline ticket={ticket} />
              </div>
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
    </div>
  )
}

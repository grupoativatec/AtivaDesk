'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  status: 'READ' | 'UNREAD'
  title: string
  message: string
  createdAt: string
  readAt: string | null
  ticketId: string | null
  ticket: {
    id: string
    title: string
    status: string
    priority: string
  } | null
  metadata: Record<string, any> | null
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const previousUnreadCountRef = useRef<number | null>(null)
  const previousNotificationIdsRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Garantir que o componente só renderize no cliente para evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          const newNotifications = data.notifications || []
          const previousIds = previousNotificationIdsRef.current
          const newIds = new Set<string>(newNotifications.map((n: Notification) => n.id))
          
          // Verificar se há novas notificações (IDs que não existiam antes)
          // Só toca se já havia notificações anteriores (não é a primeira carga)
          const hasNewNotifications = [...newIds].some((id) => !previousIds.has(id))
          
          if (hasNewNotifications && previousIds.size > 0) {
            // Reproduzir som de notificação
            try {
              if (audioRef.current) {
                audioRef.current.currentTime = 0
                audioRef.current.play().catch((err) => {
                  console.error('Erro ao reproduzir som de notificação:', err)
                })
              }
            } catch (error) {
              console.error('Erro ao reproduzir som:', error)
            }
          }
          
          previousNotificationIdsRef.current = newIds
          setNotifications(newNotifications)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar contagem de não lidas
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications/count')
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          const newCount = data.count || 0
          const previousCount = previousUnreadCountRef.current
          
          // Se o contador aumentou, significa que chegou uma nova notificação
          // Só toca se já havia um contador anterior (não é a primeira carga)
          if (previousCount !== null && newCount > previousCount) {
            // Reproduzir som de notificação
            try {
              if (audioRef.current) {
                audioRef.current.currentTime = 0
                audioRef.current.play().catch((err) => {
                  console.error('Erro ao reproduzir som de notificação:', err)
                })
              }
            } catch (error) {
              console.error('Erro ao reproduzir som:', error)
            }
          }
          
          previousUnreadCountRef.current = newCount
          setUnreadCount(newCount)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações:', error)
    }
  }, [])

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
      })

      if (res.ok) {
        // Atualizar estado local
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, status: 'READ' as const, readAt: new Date().toISOString() }
              : notif
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
        // Recarregar contagem para garantir sincronização
        fetchUnreadCount()
      } else {
        toast.error('Erro ao marcar notificação como lida')
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
      toast.error('Erro ao marcar notificação como lida')
    }
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications/read-all', {
        method: 'PATCH',
      })

      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          setNotifications((prev) =>
            prev.map((notif) => ({
              ...notif,
              status: 'READ' as const,
              readAt: new Date().toISOString(),
            }))
          )
          setUnreadCount(0)
          // Recarregar notificações para atualizar a lista
          fetchNotifications()
          toast.success(`${data.count} notificação(ões) marcada(s) como lida(s)`)
        }
      } else {
        toast.error('Erro ao marcar todas como lidas')
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast.error('Erro ao marcar todas como lidas')
    }
  }, [])

  // Garantir que o componente só renderize no cliente para evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar referência de áudio
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      audioRef.current = new Audio('/audio/new-notification.mp3')
      audioRef.current.volume = 0.5 // Volume em 50%
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [mounted])

  // Carregar contagem inicial
  useEffect(() => {
    if (mounted) {
      fetchUnreadCount()
    }
  }, [mounted, fetchUnreadCount])

  // Carregar notificações quando o popover abre
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  // Polling para atualizar contagem a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
      if (open) {
        fetchNotifications()
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [fetchUnreadCount, fetchNotifications, open])

  // Função para obter cor do badge baseado no tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NEW_TICKET':
        return 'bg-blue-500'
      case 'NEW_MESSAGE':
        return 'bg-green-500'
      case 'TICKET_ASSIGNED':
        return 'bg-purple-500'
      case 'TICKET_STATUS_CHANGED':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Função para obter ícone baseado no tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_TICKET':
        return '🎫'
      case 'NEW_MESSAGE':
        return '💬'
      case 'TICKET_ASSIGNED':
        return '👤'
      case 'TICKET_STATUS_CHANGED':
        return '🔄'
      default:
        return '🔔'
    }
  }

  // Evitar hydration mismatch - só renderizar Popover no cliente
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 z-[100]" 
        align="end" 
        side="right"
        sideOffset={8}
        alignOffset={-8}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação não lida
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications
                  .filter((n) => n.status === 'UNREAD')
                  .slice(0, 10)
                  .map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative px-4 py-3 transition-colors hover:bg-accent/50',
                      notification.status === 'UNREAD' && 'bg-accent/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Ícone do tipo */}
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs',
                          getNotificationColor(notification.type)
                        )}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-tight">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>

                          {/* Botão marcar como lida */}
                          {notification.status === 'UNREAD' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Link para o ticket */}
                        {notification.ticketId && (
                          <Link
                            href={`/admin/tickets/${notification.ticketId}`}
                            onClick={() => {
                              markAsRead(notification.id)
                              setOpen(false)
                            }}
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            Ver chamado →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Indicador de não lida */}
                    {notification.status === 'UNREAD' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2">
              <Link
                href="/admin/tickets"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline text-center block"
              >
                Ver todos os chamados
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

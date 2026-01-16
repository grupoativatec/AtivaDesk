"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TicketTimeline, generateTimelineEvents } from "../shared/ticket-timeline"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

type TimelineModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function TimelineModal({ open, onOpenChange, ticket }: TimelineModalProps) {
  const allEvents = generateTimelineEvents(ticket)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Histórico Completo de Atividades
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-4">
            {allEvents.map((event, index) => {
              const EventIcon = event.icon
              const timeFormatted = format(event.timestamp, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })
              const isLast = index === allEvents.length - 1

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
                        <div className="text-sm font-semibold text-foreground">
                          {event.title}
                        </div>
                        {event.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </div>
                        )}
                        {event.user && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                            <div className="size-5 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-[10px] font-semibold">
                                {event.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .substring(0, 2)}
                              </span>
                            </div>
                            <span>{event.user.name}</span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="text-muted-foreground/80">{event.user.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Clock className="size-3" />
                      <span title={timeFormatted}>{timeFormatted}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

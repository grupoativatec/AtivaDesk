"use client"

import { TaskActivityEvent } from "./task-activity.types"
import { formatDistanceToNow, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Edit, Plus, Minus, Clock } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TaskActivityTimelineProps {
    events: TaskActivityEvent[]
}

export function TaskActivityTimeline({ events }: TaskActivityTimelineProps) {
    if (events.length === 0) {
        return null
    }

    const getEventIcon = (type: TaskActivityEvent["type"]) => {
        switch (type) {
            case "TASK_UPDATED":
                return Edit
            case "TIME_ENTRY_ADDED":
                return Plus
            case "TIME_ENTRY_DELETED":
                return Minus
            default:
                return Clock
        }
    }

    const getEventIconColor = (type: TaskActivityEvent["type"]) => {
        switch (type) {
            case "TASK_UPDATED":
                return "text-blue-600 dark:text-blue-400"
            case "TIME_ENTRY_ADDED":
                return "text-green-600 dark:text-green-400"
            case "TIME_ENTRY_DELETED":
                return "text-red-600 dark:text-red-400"
            default:
                return "text-muted-foreground"
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="space-y-4">
            {events.map((event, index) => {
                const Icon = getEventIcon(event.type)
                const iconColor = getEventIconColor(event.type)
                const eventDate = new Date(event.createdAt)
                const timeAgo = formatDistanceToNow(eventDate, {
                    addSuffix: true,
                    locale: ptBR,
                })
                const fullDate = format(eventDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

                return (
                    <div key={event.id}>
                        <div className="flex gap-4">
                            {/* Ícone e linha vertical */}
                            <div className="flex flex-col items-center shrink-0">
                                <div
                                    className={cn(
                                        "size-10 rounded-full bg-muted flex items-center justify-center border-2 border-background",
                                        iconColor
                                    )}
                                >
                                    <Icon className="size-5" />
                                </div>
                                {index < events.length - 1 && (
                                    <div className="w-0.5 h-full min-h-[60px] bg-border dark:bg-border/30 mt-2" />
                                )}
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0 pb-6">
                                <div className="flex items-start gap-3 mb-2">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="text-xs">
                                            {getInitials(event.actor.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm text-foreground">
                                                {event.actor.name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">{event.message}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-11">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        <span>{timeAgo}</span>
                                        <span>•</span>
                                        <span>{fullDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

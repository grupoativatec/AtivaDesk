"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type TicketTimerProps = {
  inProgressAt: string | Date | null
  timeSpentMinutes: number | null
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
}

export function TicketTimer({ inProgressAt, timeSpentMinutes, status }: TicketTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<string>("")

  useEffect(() => {
    // Se o ticket está resolvido/fechado, mostrar tempo total
    if (status === "RESOLVED" || status === "CLOSED") {
      if (timeSpentMinutes !== null) {
        const hours = Math.floor(timeSpentMinutes / 60)
        const minutes = timeSpentMinutes % 60
        if (hours > 0) {
          setElapsedTime(`${hours}h ${minutes}min`)
        } else {
          setElapsedTime(`${minutes}min`)
        }
      } else {
        setElapsedTime("—")
      }
      return
    }

    // Se está em andamento, calcular tempo em tempo real
    if (status === "IN_PROGRESS" && inProgressAt) {
      const updateTimer = () => {
        const startTime = new Date(inProgressAt)
        const now = new Date()
        const diffMs = now.getTime() - startTime.getTime()
        const diffSeconds = Math.floor(diffMs / 1000)
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
      const interval = setInterval(updateTimer, 1000) // Atualizar a cada segundo

      return () => clearInterval(interval)
    }

    // Se não está em andamento, não mostrar timer
    setElapsedTime("")
  }, [inProgressAt, timeSpentMinutes, status])

  // Não mostrar se não há dados
  if (status === "IN_PROGRESS" && !inProgressAt) {
    return null
  }
  
  if ((status === "RESOLVED" || status === "CLOSED") && timeSpentMinutes === null) {
    return null
  }

  if (!elapsedTime) {
    return null
  }

  const isActive = status === "IN_PROGRESS"

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border",
        isActive
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-muted/50 text-muted-foreground border-border/50"
      )}
    >
      <Clock className={cn("size-4", isActive && "animate-pulse")} />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {isActive ? "Tempo dedicado" : "Tempo total"}
        </span>
        <span className={cn("text-sm font-semibold", isActive && "text-primary")}>
          {elapsedTime || "0min"}
        </span>
      </div>
    </div>
  )
}

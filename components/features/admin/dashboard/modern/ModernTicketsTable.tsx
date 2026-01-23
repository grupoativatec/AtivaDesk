"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface ModernTicketsTableProps {
  tickets: Array<{
    id: string
    title: string
    status: string
    priority: string
    category: string
    unit: string
    assignee?: {
      id: string
      name: string
    } | null
    createdAt: string
  }>
  loading?: boolean
}

export function ModernTicketsTable({
  tickets,
  loading,
}: ModernTicketsTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Aberto
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
          >
            <Clock className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        )
      case "RESOLVED":
      case "CLOSED":
        return (
          <Badge
            variant="outline"
            className="text-xs bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {status === "RESOLVED" ? "Resolvido" : "Fechado"}
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 dark:text-red-500"
      case "HIGH":
        return "text-orange-600 dark:text-orange-500"
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-500"
      default:
        return "text-blue-600 dark:text-blue-500"
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Chamados Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum chamado encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {tickets.slice(0, 8).map((ticket) => (
              <div
                key={ticket.id}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-lg",
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  "border border-transparent hover:border-border"
                )}
                onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {ticket.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(ticket.status)}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getPriorityColor(ticket.priority)
                      )}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.category}
                    </span>
                    {ticket.unit && (
                      <span className="text-xs text-muted-foreground">
                        • {ticket.unit}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      • {formatDistanceToNow(new Date(ticket.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ticket.assignee && (
                    <span className="text-xs text-muted-foreground">
                      {ticket.assignee.name}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/tickets/${ticket.id}`)
                        }}
                      >
                        Ver Detalhes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

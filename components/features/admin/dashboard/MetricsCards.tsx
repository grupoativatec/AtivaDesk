"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Ticket,
  Clock,
  AlertTriangle,
  CalendarX,
  CheckSquare,
  FolderOpen,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  metrics: {
    ticketsOpen: number
    ticketsInProgress: number
    ticketsUrgent: number
    ticketsOverdue: number
    tasksOpen: number
    projectsActive: number
  }
  loading?: boolean
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  const router = useRouter()

  const statCards = [
    {
      label: "Tickets Abertos",
      value: metrics.ticketsOpen,
      icon: Ticket,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
      hoverColor: "hover:bg-amber-500/5",
      route: "/admin/tickets?status=OPEN",
    },
    {
      label: "Tickets em Andamento",
      value: metrics.ticketsInProgress,
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
      hoverColor: "hover:bg-orange-500/5",
      route: "/admin/tickets?status=IN_PROGRESS",
    },
    {
      label: "Tickets Urgentes",
      value: metrics.ticketsUrgent,
      icon: AlertTriangle,
      color: "bg-red-500/10 text-red-600 dark:text-red-500",
      hoverColor: "hover:bg-red-500/5",
      route: "/admin/tickets?priority=URGENT",
      highlight: true,
    },
    {
      label: "Tickets Vencidos",
      value: metrics.ticketsOverdue,
      icon: CalendarX,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-500",
      hoverColor: "hover:bg-purple-500/5",
      route: "/admin/tickets",
    },
    {
      label: "Tarefas Abertas",
      value: metrics.tasksOpen,
      icon: CheckSquare,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
      hoverColor: "hover:bg-blue-500/5",
      route: "/admin/tarefas",
    },
    {
      label: "Projetos Ativos",
      value: metrics.projectsActive,
      icon: FolderOpen,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
      hoverColor: "hover:bg-emerald-500/5",
      route: "/admin/projetos?status=ACTIVE",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={cn(
                "group cursor-pointer border-0 shadow-sm transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5",
                stat.hoverColor,
                stat.highlight && "ring-2 ring-red-500/20"
              )}
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-2.5 rounded-lg", stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.highlight && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-red-500/10 text-red-600 dark:text-red-500">
                      Urgente
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold tracking-tight mb-1 sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

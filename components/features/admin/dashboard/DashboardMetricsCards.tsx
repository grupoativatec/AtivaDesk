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
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface DashboardMetricsCardsProps {
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

export function DashboardMetricsCards({ metrics, loading }: DashboardMetricsCardsProps) {
  const router = useRouter()

  const statCards = [
    {
      label: "Tickets Abertos",
      value: metrics.ticketsOpen,
      trend: "+12.5%",
      trendUp: true,
      description: "Tendência de alta este mês",
      subDescription: "Chamados nos últimos 6 meses",
      icon: Ticket,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
      hoverColor: "hover:bg-amber-500/5",
      route: "/admin/tickets?status=OPEN",
    },
    {
      label: "Tickets em Andamento",
      value: metrics.ticketsInProgress,
      trend: "-5.2%",
      trendUp: false,
      description: "Queda neste período",
      subDescription: "Requer atenção",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-500",
      hoverColor: "hover:bg-orange-500/5",
      route: "/admin/tickets?status=IN_PROGRESS",
    },
    {
      label: "Tickets Urgentes",
      value: metrics.ticketsUrgent,
      trend: "+8.3%",
      trendUp: true,
      description: "Aumento de urgências",
      subDescription: "Prioridade máxima",
      icon: AlertTriangle,
      color: "bg-red-500/10 text-red-600 dark:text-red-500",
      hoverColor: "hover:bg-red-500/5",
      route: "/admin/tickets?priority=URGENT",
      highlight: true,
    },
    {
      label: "Tarefas Abertas",
      value: metrics.tasksOpen,
      trend: "+15.0%",
      trendUp: true,
      description: "Crescimento constante",
      subDescription: "Atinge as projeções",
      icon: CheckSquare,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
      hoverColor: "hover:bg-blue-500/5",
      route: "/admin/tarefas",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm min-w-0 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <Skeleton className="h-8 w-8 rounded-lg mb-4" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="min-w-0 w-full"
          >
            <Card
              className={cn(
                "group cursor-pointer border-0 shadow-sm transition-all duration-200",
                "hover:shadow-md hover:-translate-y-0.5",
                stat.hoverColor,
                stat.highlight && "ring-2 ring-red-500/20",
                "w-full min-w-0 overflow-hidden"
              )}
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-4 sm:p-6 min-w-0">
                <div className="flex items-start justify-between mb-4 min-w-0 gap-2">
                  <div className={cn("p-2 rounded-lg shrink-0", stat.color)}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-medium px-1.5 sm:px-2 py-0.5 shrink-0",
                      stat.trendUp
                        ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                    )}
                  >
                    <TrendIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
                    <span className="text-[10px] sm:text-xs">{stat.trend}</span>
                  </Badge>
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 break-words">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 break-words">
                  {stat.label}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground/80 break-words line-clamp-2">
                  {stat.description}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5 break-words line-clamp-1">
                  {stat.subDescription}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

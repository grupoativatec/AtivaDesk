"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DashboardMetricsCards } from "@/components/features/admin/dashboard/DashboardMetricsCards"
import { DashboardTable } from "@/components/features/admin/dashboard/DashboardTable"
import { useRouter } from "next/navigation"

interface DashboardMetrics {
  ticketsOpen: number
  ticketsInProgress: number
  ticketsUrgent: number
  ticketsOverdue: number
  tasksOpen: number
  projectsActive: number
}

interface TicketsData {
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
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ticketsOpen: 0,
    ticketsInProgress: 0,
    ticketsUrgent: 0,
    ticketsOverdue: 0,
    tasksOpen: 0,
    projectsActive: 0,
  })
  const [tickets, setTickets] = useState<TicketsData>({ tickets: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [metricsRes, ticketsRes] = await Promise.all([
        fetch("/api/admin/dashboard/metrics"),
        fetch("/api/admin/tickets?status=OPEN&limit=10"),
      ])

      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics(data.metrics)
      }

      if (ticketsRes.ok) {
        const data = await ticketsRes.json()
        const ticketsList = data.tickets || data.ok ? data.tickets : []
        setTickets({
          tickets: ticketsList.slice(0, 20).map((t: any) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            category: t.category,
            unit: t.unit || "",
            assignee: t.assignee,
            createdAt: t.createdAt,
          })),
        })
      }
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Container com max-width responsivo */}
      <div className="mx-auto max-w-[1920px] px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 sm:space-y-8 md:space-y-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Visão geral do sistema e métricas
                </p>
              </div>
              <Button
                onClick={() => router.push("/admin/tickets/new")}
                size="sm"
                className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Novo Chamado</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>

            {/* Métricas Cards */}
            <section>
              <DashboardMetricsCards metrics={metrics} loading={loading} />
            </section>

            {/* Tabela de Chamados */}
            <section>
              <DashboardTable tickets={tickets.tickets} loading={loading} />
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

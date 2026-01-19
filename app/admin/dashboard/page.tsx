"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MetricsCards } from "@/components/features/admin/dashboard/MetricsCards"
import { MyWorkSection } from "@/components/features/admin/dashboard/MyWorkSection"
import { KanbanSummary } from "@/components/features/admin/dashboard/KanbanSummary"
import { RecentActivities } from "@/components/features/admin/dashboard/RecentActivities"

interface DashboardMetrics {
  ticketsOpen: number
  ticketsInProgress: number
  ticketsUrgent: number
  ticketsOverdue: number
  tasksOpen: number
  projectsActive: number
}

interface MyWorkData {
  tickets: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
    openedBy: {
      id: string
      name: string
    }
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    updatedAt: string
    project: {
      id: string
      name: string
    }
    assignees: Array<{
      id: string
      name: string
    }>
  }>
}

interface KanbanSummaryData {
  columns: {
    todo: {
      count: number
      cards: Array<any>
    }
    inProgress: {
      count: number
      cards: Array<any>
    }
    blocked: {
      count: number
      cards: Array<any>
    }
  }
}

interface ActivitiesData {
  activities: Array<{
    id: string
    type: string
    title: string
    description: string
    actor?: {
      id: string
      name: string
    }
    entity: {
      type: string
      id: string
      project?: {
        id: string
        name: string
      }
    }
    createdAt: string
    meta?: any
  }>
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    ticketsOpen: 0,
    ticketsInProgress: 0,
    ticketsUrgent: 0,
    ticketsOverdue: 0,
    tasksOpen: 0,
    projectsActive: 0,
  })
  const [myWork, setMyWork] = useState<MyWorkData>({
    tickets: [],
    tasks: [],
  })
  const [kanbanSummary, setKanbanSummary] = useState<KanbanSummaryData | null>(null)
  const [activities, setActivities] = useState<ActivitiesData>({ activities: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [metricsRes, myWorkRes, kanbanRes, activitiesRes] = await Promise.all([
        fetch("/api/admin/dashboard/metrics"),
        fetch("/api/admin/dashboard/my-work"),
        fetch("/api/admin/dashboard/kanban-summary"),
        fetch("/api/admin/dashboard/activities"),
      ])

      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics(data.metrics)
      }

      if (myWorkRes.ok) {
        const data = await myWorkRes.json()
        setMyWork(data)
      }

      if (kanbanRes.ok) {
        const data = await kanbanRes.json()
        setKanbanSummary(data)
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json()
        setActivities(data)
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
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="py-6 sm:py-8 lg:py-10 xl:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 sm:space-y-10 lg:space-y-12"
          >
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                Visão geral do sistema e seu trabalho
              </p>
            </div>

            {/* Métricas - Grid responsivo */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">Métricas Gerais</h2>
              </div>
              <MetricsCards metrics={metrics} loading={loading} />
            </section>

            {/* Grid principal - Meu Trabalho e Kanban */}
            <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-12">
              {/* Meu Trabalho */}
              <div className="xl:col-span-7">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">Meu Trabalho</h2>
                </div>
                <MyWorkSection
                  tickets={myWork.tickets}
                  tasks={myWork.tasks}
                  loading={loading}
                />
              </div>

              {/* Kanban Resumido */}
              <div className="xl:col-span-5">
                {kanbanSummary && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">Kanban</h2>
                    </div>
                    <KanbanSummary columns={kanbanSummary.columns} loading={loading} />
                  </>
                )}
              </div>
            </div>

            {/* Atividades Recentes */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl">Atividades Recentes</h2>
              </div>
              <RecentActivities activities={activities.activities} loading={loading} />
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

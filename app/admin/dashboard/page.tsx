"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Ticket, Clock, UserCheck, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

type Stats = {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/tickets")
      const data = await res.json()

      if (res.ok && data.tickets) {
        const tickets = data.tickets
        setStats({
          total: tickets.length,
          open: tickets.filter((t: any) => t.status === "OPEN").length,
          inProgress: tickets.filter((t: any) => t.status === "IN_PROGRESS").length,
          resolved: tickets.filter((t: any) => t.status === "RESOLVED").length,
          closed: tickets.filter((t: any) => t.status === "CLOSED").length,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total de Tickets",
      value: stats.total,
      icon: Ticket,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Abertos",
      value: stats.open,
      icon: AlertCircle,
      color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Em Andamento",
      value: stats.inProgress,
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      label: "Resolvidos",
      value: stats.resolved,
      icon: UserCheck,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Modern Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-x-0 sm:border-x rounded-none sm:rounded-xl md:rounded-2xl bg-card/60 backdrop-blur-sm shadow-lg p-4 sm:p-6 md:p-8 lg:p-10"
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Visão geral do sistema de tickets
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg sm:rounded-xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                    onClick={() => router.push("/admin/tickets")}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                        <Icon className="size-5 sm:size-6" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

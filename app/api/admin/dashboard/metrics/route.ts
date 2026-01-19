import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/dashboard/metrics
 * Retorna métricas agregadas para o dashboard
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver métricas." },
        { status: 403 }
      )
    }

    // Buscar todas as métricas em paralelo
    const [
      ticketsOpen,
      ticketsInProgress,
      ticketsUrgent,
      ticketsOverdue,
      tasksOpen,
      projectsActive,
    ] = await Promise.all([
      // Tickets abertos
      prisma.ticket.count({
        where: { status: "OPEN" },
      }),
      // Tickets em andamento
      prisma.ticket.count({
        where: { status: "IN_PROGRESS" },
      }),
      // Tickets urgentes (qualquer status)
      prisma.ticket.count({
        where: { priority: "URGENT" },
      }),
      // Tickets vencidos (SLA ou prazo)
      // Considerando tickets abertos ou em progresso que foram criados há mais de 7 dias
      prisma.ticket.count({
        where: {
          status: { in: ["OPEN", "IN_PROGRESS"] },
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
          },
        },
      }),
      // Tarefas abertas (não concluídas)
      prisma.task.count({
        where: {
          status: { not: "DONE" },
        },
      }),
      // Projetos ativos
      prisma.project.count({
        where: { status: "ACTIVE" },
      }),
    ])

    return NextResponse.json({
      metrics: {
        ticketsOpen,
        ticketsInProgress,
        ticketsUrgent,
        ticketsOverdue,
        tasksOpen,
        projectsActive,
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar métricas" },
      { status: 500 }
    )
  }
}

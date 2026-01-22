import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/dashboard/activities
 * Retorna atividades recentes do sistema
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
        { error: "Acesso negado. Apenas administradores podem ver atividades." },
        { status: 403 }
      )
    }

    const limit = 20

    // Buscar atividades recentes de diferentes fontes
    const [
      recentTickets,
      recentTasks,
      recentProjects,
      recentTaskActivities,
    ] = await Promise.all([
      // Tickets criados recentemente
      prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          openedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      // Tarefas concluídas recentemente
      prisma.task.findMany({
        where: {
          status: "DONE",
          completedAt: { not: null },
        },
        take: 5,
        orderBy: { completedAt: "desc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      // Projetos arquivados recentemente
      prisma.project.findMany({
        where: {
          status: "ARCHIVED",
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      // Atividades de tarefas (mudanças de status)
      prisma.taskActivityEvent.findMany({
        where: {
          type: "TASK_STATUS_CHANGED",
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ])

    // Combinar e ordenar todas as atividades
    const activities: any[] = []

    // Tickets criados
    recentTickets.forEach((ticket) => {
      activities.push({
        id: `ticket-${ticket.id}`,
        type: "TICKET_CREATED",
        title: "Ticket criado",
        description: ticket.title,
        actor: ticket.openedBy,
        entity: {
          type: "ticket",
          id: ticket.id,
        },
        createdAt: ticket.createdAt.toISOString(),
      })
    })

    // Tarefas concluídas
    recentTasks.forEach((task) => {
      activities.push({
        id: `task-done-${task.id}`,
        type: "TASK_COMPLETED",
        title: "Tarefa concluída",
        description: task.project ? `${task.title} - ${task.project.name}` : task.title,
        entity: {
          type: "task",
          id: task.id,
          project: task.project,
        },
        createdAt: task.completedAt!.toISOString(),
      })
    })

    // Projetos arquivados
    recentProjects.forEach((project) => {
      activities.push({
        id: `project-archived-${project.id}`,
        type: "PROJECT_ARCHIVED",
        title: "Projeto arquivado",
        description: project.name,
        entity: {
          type: "project",
          id: project.id,
        },
        createdAt: project.updatedAt.toISOString(),
      })
    })

    // Mudanças de status de tarefas
    recentTaskActivities.forEach((activity) => {
      activities.push({
        id: `task-activity-${activity.id}`,
        type: "TASK_STATUS_CHANGED",
        title: "Status de tarefa alterado",
        description: activity.task.project 
          ? `${activity.task.title} - ${activity.task.project.name}` 
          : activity.task.title,
        actor: activity.actor,
        entity: {
          type: "task",
          id: activity.task.id,
          project: activity.task.project,
        },
        meta: activity.meta,
        createdAt: activity.createdAt.toISOString(),
      })
    })

    // Ordenar por data (mais recente primeiro) e limitar
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      activities: activities.slice(0, limit),
    })
  } catch (error: any) {
    console.error("Erro ao buscar atividades:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar atividades" },
      { status: 500 }
    )
  }
}

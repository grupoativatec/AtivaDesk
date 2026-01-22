import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/dashboard/my-work
 * Retorna tickets e tarefas atribuídos ao usuário logado
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

    // Buscar tickets e tarefas atribuídos ao usuário
    const [assignedTickets, assignedTasks] = await Promise.all([
      // Tickets atribuídos
      prisma.ticket.findMany({
        where: {
          assigneeId: user.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        include: {
          openedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" }, // Urgentes primeiro
          { createdAt: "asc" }, // Mais antigos primeiro
        ],
        take: 10,
      }),
      // Tarefas atribuídas
      prisma.task.findMany({
        where: {
          assignees: {
            some: {
              userId: user.id,
            },
          },
          status: { not: "DONE" },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { priority: "desc" }, // Urgentes primeiro
          { updatedAt: "desc" }, // Mais recentes primeiro
        ],
        take: 10,
      }),
    ])

    // Transformar tickets
    const tickets = assignedTickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      openedBy: ticket.openedBy,
      assignee: ticket.assignee,
    }))

    // Transformar tarefas
    const tasks = assignedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      assignees: task.assignees.map((ta) => ({
        id: ta.user.id,
        name: ta.user.name,
      })),
      updatedAt: task.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      tickets,
      tasks,
    })
  } catch (error: any) {
    console.error("Erro ao buscar meu trabalho:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar meu trabalho" },
      { status: 500 }
    )
  }
}

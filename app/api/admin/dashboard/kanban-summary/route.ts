import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/dashboard/kanban-summary
 * Retorna resumo do Kanban (3 colunas principais)
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

    // Buscar todos os boards que o usuário tem acesso
    const boards = await prisma.kanbanBoard.findMany({
      where: {
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        columns: {
          include: {
            cards: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    // Agrupar cards por status (TODO, IN_PROGRESS, BLOCKED)
    const todoCards: any[] = []
    const inProgressCards: any[] = []
    const blockedCards: any[] = []

    boards.forEach((board) => {
      board.columns.forEach((column) => {
        column.cards.forEach((card) => {
          const cardData = {
            id: card.id,
            title: card.title,
            priority: card.priority || "MEDIUM",
            assignee: card.assignee,
            boardId: board.id,
            boardName: board.name,
            project: board.projectId
              ? {
                  id: board.projectId,
                  name: board.project?.name || "",
                }
              : null,
          }

          if (column.status === "TODO") {
            todoCards.push(cardData)
          } else if (column.status === "IN_PROGRESS") {
            inProgressCards.push(cardData)
          } else if (column.status === "REVIEW") {
            // REVIEW é usado como "bloqueado" no resumo
            blockedCards.push(cardData)
          }
        })
      })
    })

    // Ordenar por prioridade (URGENT primeiro) e pegar os 5 mais recentes/críticos
    const sortByPriority = (a: any, b: any) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      const aPriority = a.priority || "MEDIUM"
      const bPriority = b.priority || "MEDIUM"
      return (
        (priorityOrder[bPriority as keyof typeof priorityOrder] || 0) -
        (priorityOrder[aPriority as keyof typeof priorityOrder] || 0)
      )
    }

    return NextResponse.json({
      columns: {
        todo: {
          count: todoCards.length,
          cards: todoCards.sort(sortByPriority).slice(0, 5),
        },
        inProgress: {
          count: inProgressCards.length,
          cards: inProgressCards.sort(sortByPriority).slice(0, 5),
        },
        blocked: {
          count: blockedCards.length,
          cards: blockedCards.sort(sortByPriority).slice(0, 5),
        },
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar resumo do Kanban:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar resumo do Kanban" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformCard } from "@/lib/kanban/transformers"
import { canEditBoard } from "@/lib/kanban/permissions"
import { mapKanbanStatusToTaskStatus } from "@/lib/kanban/task-mapper"

const moveCardSchema = z.object({
  sourceColumnId: z.string().min(1, "SourceColumnId é obrigatório"),
  destinationColumnId: z.string().min(1, "DestinationColumnId é obrigatório"),
  newIndex: z.number().int().min(0, "NewIndex deve ser >= 0"),
})

// PATCH /api/kanban/cards/:cardId/move - Move e reordena card
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { cardId } = await params

    // Busca o card com o board
    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: {
        board: true,
        column: true,
      },
    })

    if (!card) {
      return NextResponse.json(
        { error: "Card não encontrado" },
        { status: 404 }
      )
    }

    // Verifica se pode editar o board
    const canEdit = await canEditBoard(user.id, card.boardId)
    if (!canEdit) {
      return NextResponse.json(
        { error: "Sem permissão para mover cards" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = moveCardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const { sourceColumnId, destinationColumnId, newIndex } = parsed.data

    // Verifica se as colunas existem e pertencem ao mesmo board
    const [sourceColumn, destColumn] = await Promise.all([
      prisma.kanbanColumn.findFirst({
        where: {
          id: sourceColumnId,
          boardId: card.boardId,
        },
      }),
      prisma.kanbanColumn.findFirst({
        where: {
          id: destinationColumnId,
          boardId: card.boardId,
        },
      }),
    ])

    if (!sourceColumn || !destColumn) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      )
    }

    // Busca todos os cards da coluna destino (ordenados)
    const destCards = await prisma.kanbanCard.findMany({
      where: { columnId: destinationColumnId },
      orderBy: { order: "asc" },
      select: { id: true, order: true },
    })

    // Remove o card da coluna origem (se estiver lá)
    if (card.columnId === sourceColumnId) {
      // Atualiza a ordem dos cards restantes na coluna origem
      const sourceCards = await prisma.kanbanCard.findMany({
        where: {
          columnId: sourceColumnId,
          id: { not: cardId },
        },
        orderBy: { order: "asc" },
      })

      // Reordena os cards da origem
      await Promise.all(
        sourceCards.map((c, index) =>
          prisma.kanbanCard.update({
            where: { id: c.id },
            data: { order: index },
          })
        )
      )
    }

    // Remove o card da lista de destino se já estiver lá
    const filteredDestCards = destCards.filter((c) => c.id !== cardId)

    // Calcula a nova ordem baseada no newIndex
    let newOrder: number
    if (filteredDestCards.length === 0) {
      newOrder = 0
    } else if (newIndex >= filteredDestCards.length) {
      newOrder = filteredDestCards[filteredDestCards.length - 1].order + 1
    } else if (newIndex === 0) {
      newOrder = filteredDestCards[0].order - 1
      // Se ficar negativo, ajusta todos
      if (newOrder < 0) {
        await Promise.all(
          filteredDestCards.map((c, index) =>
            prisma.kanbanCard.update({
              where: { id: c.id },
              data: { order: index + 1 },
            })
          )
        )
        newOrder = 0
      }
    } else {
      const prevCard = filteredDestCards[newIndex - 1]
      const nextCard = filteredDestCards[newIndex]
      newOrder = Math.floor((prevCard.order + nextCard.order) / 2)
      // Se der empate, reordena todos
      if (newOrder === prevCard.order || newOrder === nextCard.order) {
        await Promise.all(
          filteredDestCards.map((c, index) =>
            prisma.kanbanCard.update({
              where: { id: c.id },
              data: { order: index + (index >= newIndex ? 1 : 0) },
            })
          )
        )
        newOrder = newIndex
      }
    }

    // Atualiza o card
    const updatedCard = await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        columnId: destinationColumnId,
        order: newOrder,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: true,
        board: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Se o card está vinculado a uma Task, atualiza o status da Task
    if (updatedCard.taskId) {
      try {
        const taskStatus = mapKanbanStatusToTaskStatus(destColumn.status as any)
        await prisma.task.update({
          where: { id: updatedCard.taskId },
          data: { status: taskStatus },
        })
      } catch (error) {
        // Log do erro mas não falha a operação
        console.error("Erro ao atualizar status da task:", error)
      }
    }

    const transformedCard = transformCard(updatedCard)

    return NextResponse.json({
      ok: true,
      card: transformedCard,
    })
  } catch (error: any) {
    console.error("Erro ao mover card:", error)
    return NextResponse.json(
      { error: "Erro interno ao mover card" },
      { status: 500 }
    )
  }
}

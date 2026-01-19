import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformCard } from "@/lib/kanban/transformers"
import { canEditBoard } from "@/lib/kanban/permissions"

const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(), // ISO string ou null
  tags: z.array(z.string()).optional(),
  assigneeId: z.string().nullable().optional(),
})

// PATCH /api/kanban/cards/:cardId - Edita card
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
        { error: "Sem permissão para editar cards" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateCardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, priority, dueDate, tags, assigneeId } = parsed.data

    // Verifica se assignee existe (se fornecido e não null)
    if (assigneeId !== undefined && assigneeId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      })

      if (!assignee) {
        return NextResponse.json(
          { error: "Usuário responsável não encontrado" },
          { status: 404 }
        )
      }
    }

    // Atualiza o card
    const updatedCard = await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate === null || dueDate === "" ? null : new Date(dueDate),
        }),
        ...(tags !== undefined && { tags }),
        ...(assigneeId !== undefined && { assigneeId }),
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

    const transformedCard = transformCard(updatedCard)

    return NextResponse.json({
      ok: true,
      card: transformedCard,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar card:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar card" },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/cards/:cardId - Remove card
export async function DELETE(
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
        { error: "Sem permissão para deletar cards" },
        { status: 403 }
      )
    }

    await prisma.kanbanCard.delete({
      where: { id: cardId },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error: any) {
    console.error("Erro ao deletar card:", error)
    return NextResponse.json(
      { error: "Erro interno ao deletar card" },
      { status: 500 }
    )
  }
}

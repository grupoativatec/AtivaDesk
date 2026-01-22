import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { isBoardAdmin } from "@/lib/kanban/permissions"

const updateColumnSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
})

// PATCH /api/kanban/boards/:boardId/columns/:columnId - Renomeia coluna
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { boardId, columnId } = await params

    // Verifica se é admin
    const isAdmin = await isBoardAdmin(user.id, boardId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem editar colunas" },
        { status: 403 }
      )
    }

    // Verifica se a coluna existe e pertence ao board
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        boardId,
      },
    })

    if (!column) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const parsed = updateColumnSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const { title } = parsed.data

    // Atualiza a coluna
    const updatedColumn = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { title },
    })

    return NextResponse.json({
      ok: true,
      column: {
        id: updatedColumn.id,
        boardId: updatedColumn.boardId,
        status: updatedColumn.status,
        title: updatedColumn.title,
        order: updatedColumn.order,
        createdAt: updatedColumn.createdAt.toISOString(),
        updatedAt: updatedColumn.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Erro ao atualizar coluna:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar coluna" },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/boards/:boardId/columns/:columnId - Deleta coluna
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; columnId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { boardId, columnId } = await params

    // Verifica se é admin
    const isAdmin = await isBoardAdmin(user.id, boardId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem deletar colunas" },
        { status: 403 }
      )
    }

    // Verifica se a coluna existe e pertence ao board
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        boardId,
      },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    })

    if (!column) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      )
    }

    // Não permite deletar se houver cards na coluna
    if (column._count.cards > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar uma coluna que contém cards. Mova ou exclua os cards primeiro." },
        { status: 400 }
      )
    }

    // Deleta a coluna
    await prisma.kanbanColumn.delete({
      where: { id: columnId },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error: any) {
    console.error("Erro ao deletar coluna:", error)
    return NextResponse.json(
      { error: "Erro interno ao deletar coluna" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { isBoardAdmin } from "@/lib/kanban/permissions"

const reorderColumnsSchema = z.object({
  columnIds: z.array(z.string()).min(1, "ColumnIds é obrigatório"),
})

// PATCH /api/kanban/boards/:boardId/columns/reorder - Reordena colunas
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { boardId } = await params

    // Verifica se é admin
    const isAdmin = await isBoardAdmin(user.id, boardId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores podem reordenar colunas" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = reorderColumnsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { columnIds } = parsed.data

    // Verifica se todas as colunas pertencem ao board
    const columns = await prisma.kanbanColumn.findMany({
      where: {
        id: { in: columnIds },
        boardId,
      },
    })

    if (columns.length !== columnIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais colunas não pertencem ao board" },
        { status: 400 }
      )
    }

    // Atualiza a ordem das colunas
    await Promise.all(
      columnIds.map((columnId, index) =>
        prisma.kanbanColumn.update({
          where: { id: columnId },
          data: { order: index },
        })
      )
    )

    return NextResponse.json({
      ok: true,
    })
  } catch (error: any) {
    console.error("Erro ao reordenar colunas:", error)
    return NextResponse.json(
      { error: "Erro interno ao reordenar colunas" },
      { status: 500 }
    )
  }
}

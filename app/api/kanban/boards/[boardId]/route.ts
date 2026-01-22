import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformBoard } from "@/lib/kanban/transformers"
import { canAccessBoard, isBoardAdmin } from "@/lib/kanban/permissions"

const updateBoardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().optional(),
})

// GET /api/kanban/boards/:boardId - Retorna board completo
export async function GET(
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

    // Primeiro verifica se o board existe
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
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
        cards: {
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
        },
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: "Board não encontrado" },
        { status: 404 }
      )
    }

    const transformedBoard = transformBoard(board)

    return NextResponse.json({
      ok: true,
      board: transformedBoard,
    })
  } catch (error: any) {
    console.error("Erro ao buscar board:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar board" },
      { status: 500 }
    )
  }
}

// PATCH /api/kanban/boards/:boardId - Atualiza board
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
        { error: "Apenas administradores podem editar o board" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateBoardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const { name, description } = parsed.data

    const board = await prisma.kanbanBoard.update({
      where: { id: boardId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
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
        cards: {
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
        },
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: "Board não encontrado" },
        { status: 404 }
      )
    }

    // Verifica se tem acesso
    const hasAccess = await canAccessBoard(user.id, boardId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const transformedBoard = transformBoard(board)

    return NextResponse.json({
      ok: true,
      board: transformedBoard,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar board:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar board" },
      { status: 500 }
    )
  }
}

// DELETE /api/kanban/boards/:boardId - Remove board
export async function DELETE(
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
        { error: "Apenas administradores podem deletar o board" },
        { status: 403 }
      )
    }

    await prisma.kanbanBoard.delete({
      where: { id: boardId },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error: any) {
    console.error("Erro ao deletar board:", error)
    return NextResponse.json(
      { error: "Erro interno ao deletar board" },
      { status: 500 }
    )
  }
}

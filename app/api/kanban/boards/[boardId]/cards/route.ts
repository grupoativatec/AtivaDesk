import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformCard } from "@/lib/kanban/transformers"
import { canEditBoard } from "@/lib/kanban/permissions"

const createCardSchema = z.object({
  columnId: z.string().min(1, "ColumnId é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(), // ISO string
  tags: z.array(z.string()).optional(),
  assigneeId: z.string().optional(),
})

// POST /api/kanban/boards/:boardId/cards - Cria card nativo no board
export async function POST(
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

    // Verifica se pode editar
    const canEdit = await canEditBoard(user.id, boardId)
    if (!canEdit) {
      return NextResponse.json(
        { error: "Sem permissão para criar cards" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createCardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { columnId, title, description, priority, dueDate, tags, assigneeId } = parsed.data

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

    // Verifica se assignee existe (se fornecido)
    if (assigneeId) {
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

    // Calcula a ordem (último card da coluna + 1)
    const lastCard = await prisma.kanbanCard.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const order = lastCard ? lastCard.order + 1 : 0

    // Cria o card
    const card = await prisma.kanbanCard.create({
      data: {
        boardId,
        columnId,
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        assigneeId,
        order,
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

    const transformedCard = transformCard(card)

    return NextResponse.json({
      ok: true,
      card: transformedCard,
    })
  } catch (error: any) {
    console.error("Erro ao criar card:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar card" },
      { status: 500 }
    )
  }
}

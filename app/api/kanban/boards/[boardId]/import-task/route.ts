import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformCard } from "@/lib/kanban/transformers"
import { canEditBoard } from "@/lib/kanban/permissions"

const importTaskSchema = z.object({
  taskId: z.string().min(1, "TaskId é obrigatório"),
  columnId: z.string().min(1, "ColumnId é obrigatório"),
})

// POST /api/kanban/boards/:boardId/import-task - Cria card vinculado à Task
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
        { error: "Sem permissão para importar tasks" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = importTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const { taskId, columnId } = parsed.data

    // Verifica se a task existe
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task não encontrada" },
        { status: 404 }
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

    // Verifica se já existe um card vinculado a essa task neste board
    const existingCard = await prisma.kanbanCard.findFirst({
      where: {
        boardId,
        taskId,
      },
    })

    if (existingCard) {
      return NextResponse.json(
        { error: "Task já está vinculada a um card neste board" },
        { status: 400 }
      )
    }

    // Pega o primeiro assignee da task (se houver)
    const firstAssignee = task.assignees[0]?.user

    // Calcula a ordem
    const lastCard = await prisma.kanbanCard.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const order = lastCard ? lastCard.order + 1 : 0

    // Cria o card vinculado à task
    const card = await prisma.kanbanCard.create({
      data: {
        boardId,
        columnId,
        taskId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: null, // Task não tem dueDate, mas card pode ter
        tags: [],
        assigneeId: firstAssignee?.id,
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
    console.error("Erro ao importar task:", error)
    return NextResponse.json(
      { error: "Erro interno ao importar task" },
      { status: 500 }
    )
  }
}

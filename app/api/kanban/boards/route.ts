import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { transformBoard } from "@/lib/kanban/transformers"
import { KanbanStatus } from "@/lib/generated/prisma/client"

const createBoardSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  projectId: z.string().optional(),
})

// GET /api/kanban/boards - Lista boards que o usuário pode acessar
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Busca boards onde o usuário é criador ou membro
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
      orderBy: {
        updatedAt: "desc",
      },
    })

    // Transforma para o formato do frontend
    const transformedBoards = boards.map(transformBoard)

    return NextResponse.json({
      ok: true,
      boards: transformedBoards,
    })
  } catch (error: any) {
    console.error("Erro ao buscar boards:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar boards" },
      { status: 500 }
    )
  }
}

// POST /api/kanban/boards - Cria board, colunas default e adiciona criador como ADMIN
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = createBoardSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, projectId } = parsed.data

    // Verifica se o projeto existe (se fornecido)
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        return NextResponse.json(
          { error: "Projeto não encontrado" },
          { status: 404 }
        )
      }
    }

    // Cria colunas primeiro para poder importar tarefas
    const columns = [
      { status: "TODO" as const, title: "A Fazer", order: 0 },
      { status: "IN_PROGRESS" as const, title: "Em Progresso", order: 1 },
      { status: "REVIEW" as const, title: "Em Revisão", order: 2 },
      { status: "DONE" as const, title: "Concluído", order: 3 },
    ]

    // Cria board com colunas default e membro ADMIN
    const board = await prisma.kanbanBoard.create({
      data: {
        name,
        description,
        projectId,
        createdById: user.id,
        columns: {
          create: columns,
        },
        members: {
          create: {
            userId: user.id,
            role: "ADMIN",
          },
        },
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

    // Se houver projectId, importa tarefas do projeto automaticamente
    if (projectId) {
      try {
        const tasks = await prisma.task.findMany({
          where: {
            projectId,
            // Não importa tarefas que já estão vinculadas a um card neste board
            kanbanCards: {
              none: {
                boardId: board.id,
              },
            },
          },
          include: {
            assignees: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              take: 1, // Pega apenas o primeiro assignee
            },
          },
        })

        // Importa cada tarefa como card
        if (tasks.length > 0) {
          const { mapTaskStatusToKanbanStatus } = await import("@/lib/kanban/task-mapper")

          // Busca as colunas criadas
          const boardColumns = await prisma.kanbanColumn.findMany({
            where: { boardId: board.id },
            orderBy: { order: "asc" },
          })

          // Agrupa tarefas por status do Kanban
          type TaskWithAssignees = typeof tasks[0]
          const tasksByStatus = new Map<string, TaskWithAssignees[]>()
          
          tasks.forEach((task) => {
            const kanbanStatus = mapTaskStatusToKanbanStatus(task.status)
            if (!tasksByStatus.has(kanbanStatus)) {
              tasksByStatus.set(kanbanStatus, [])
            }
            tasksByStatus.get(kanbanStatus)!.push(task)
          })

          // Cria cards para cada tarefa, calculando ordem por coluna
          const cardsToCreate: Array<{
            boardId: string
            columnId: string
            taskId: string
            title: string
            description: string | null
            priority: any
            dueDate: null
            tags: string[]
            assigneeId: string | null
            order: number
          }> = []

          for (const [kanbanStatusStr, statusTasks] of tasksByStatus.entries()) {
            const kanbanStatus = kanbanStatusStr as KanbanStatus
            const column = boardColumns.find((col) => col.status === kanbanStatus) || boardColumns[0]
            
            // Calcula a ordem baseada nos cards existentes na coluna
            const existingCardsCount = await prisma.kanbanCard.count({
              where: { columnId: column.id },
            })

            statusTasks.forEach((task, index) => {
              cardsToCreate.push({
                boardId: board.id,
                columnId: column.id,
                taskId: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                dueDate: null,
                tags: [],
                assigneeId: task.assignees[0]?.user.id || null,
                order: existingCardsCount + index,
              })
            })
          }

          // Cria os cards em lote
          if (cardsToCreate.length > 0) {
            await prisma.kanbanCard.createMany({
              data: cardsToCreate,
            })
          }
        }
      } catch (error) {
        // Log do erro mas não falha a criação do board
        console.error("Erro ao importar tarefas do projeto:", error)
      }
    }

    // Busca o board completo novamente para incluir os cards importados
    const boardWithCards = await prisma.kanbanBoard.findUnique({
      where: { id: board.id },
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

    if (!boardWithCards) {
      return NextResponse.json(
        { error: "Erro ao buscar board criado" },
        { status: 500 }
      )
    }

    const transformedBoard = transformBoard(boardWithCards)

    return NextResponse.json({
      ok: true,
      board: transformedBoard,
    })
  } catch (error: any) {
    console.error("Erro ao criar board:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar board" },
      { status: 500 }
    )
  }
}

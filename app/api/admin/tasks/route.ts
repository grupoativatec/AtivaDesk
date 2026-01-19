import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  TaskStatus,
  TaskPriority,
  TaskUnit,
} from "@/lib/generated/prisma/enums";
import { z } from "zod";
import {
  notifyTaskCreated,
  notifyProjectTaskAdded,
  notifyTaskAssigned,
} from "@/lib/notifications";

/**
 * Schema de validação para criação de tarefa
 */
const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  projectId: z.string().optional(),
  unit: z.nativeEnum(TaskUnit),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.BACKLOG),
  assigneeIds: z.array(z.string().min(1)).default([]),
  estimatedHours: z.number().int().min(0).default(0),
  description: z.string().optional(),
});

/**
 * GET /api/admin/tasks
 * Lista tarefas com filtros e paginação
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver tarefas." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const unit = searchParams.get("unit");
    const project = searchParams.get("project");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // Construir filtros
    const where: any = {};

    if (status && status !== "all") {
      where.status = status as TaskStatus;
    }

    if (priority && priority !== "all") {
      where.priority = priority as TaskPriority;
    }

    if (unit && unit !== "all") {
      where.unit = unit as TaskUnit;
    }

    if (project) {
      where.projectId = project;
    }

    // Busca por texto (título ou nome do projeto)
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        ...(q ? [{
          project: {
            name: { contains: q, mode: "insensitive" },
          },
        }] : []),
        {
          assignees: {
            some: {
              user: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    // Calcular offset
    const skip = (page - 1) * pageSize;

    // Buscar tarefas com relacionamentos
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
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
          timeEntries: {
            select: {
              hours: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    // Transformar para formato TaskListItem
    const tasksList = tasks.map((task) => {
      // Calcular loggedHours (soma dos timeEntries)
      const loggedHours = task.timeEntries.reduce(
        (sum, entry) => sum + Number(entry.hours),
        0
      );

      return {
        id: task.id,
        title: task.title,
        description: task.description || null,
        acceptance: task.acceptance || null,
        project: task.project ? {
          id: task.project.id,
          name: task.project.name,
        } : null,
        unit: task.unit,
        status: task.status,
        priority: task.priority,
        assignees: task.assignees.map((ta) => ({
          id: ta.user.id,
          name: ta.user.name,
        })),
        estimatedHours: task.estimatedHours,
        loggedHours,
        updatedAt: task.updatedAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      tasks: tasksList,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error: any) {
    console.error("Erro ao buscar tarefas:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar tarefas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tasks
 * Cria uma nova tarefa
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Apenas admins podem criar tarefas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar tarefas." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];
      const errorMessage = firstError?.message || "Dados inválidos";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const {
      title,
      projectId,
      unit,
      priority,
      status,
      assigneeIds,
      estimatedHours,
      description,
    } = parsed.data;

    // Verificar se o projeto existe (se fornecido) e buscar criador
    let project = null;
    if (projectId) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          createdById: true,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Projeto não encontrado" },
          { status: 404 }
        );
      }
    }

    // Verificar se status é DONE e bloquear criação direta como DONE
    if (status === TaskStatus.DONE) {
      return NextResponse.json(
        { error: "Não é possível criar uma tarefa já como DONE" },
        { status: 400 }
      );
    }

    // Verificar se os assignees existem (se houver)
    if (assigneeIds.length > 0) {
      const assignees = await prisma.user.findMany({
        where: { id: { in: assigneeIds } },
        select: { id: true },
      });

      if (assignees.length !== assigneeIds.length) {
        return NextResponse.json(
          { error: "Um ou mais responsáveis não foram encontrados" },
          { status: 400 }
        );
      }
    }

    // Criar tarefa com assignees em uma transação
    const task = await prisma.$transaction(async (tx) => {
      // Criar a tarefa
      const newTask = await tx.task.create({
        data: {
          title,
          description,
          projectId,
          unit,
          status,
          priority,
          estimatedHours,
          createdById: user.id,
          completedAt: null, // Só seta se status for DONE (mas bloqueamos isso)
          assignees: {
            create: assigneeIds.map((userId) => ({
              userId,
            })),
          },
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
          timeEntries: {
            select: {
              hours: true,
            },
          },
        },
      });

      // Registrar evento de atividade TASK_CREATED
      await tx.taskActivityEvent.create({
        data: {
          taskId: newTask.id,
          type: "TASK_CREATED",
          actorId: user.id,
          message: `${user.name} criou a tarefa "${title}"`,
          meta: {
            title,
            projectId: projectId || null,
            unit,
            priority,
            status,
          },
        },
      });

      return newTask;
    });

    // Sincronizar com Kanban: se o projeto tem um board vinculado, adiciona a tarefa automaticamente
    try {
      if (projectId) {
        const kanbanBoards = await prisma.kanbanBoard.findMany({
          where: {
            projectId: projectId,
          },
          include: {
            columns: {
              orderBy: { order: "asc" },
            },
          },
        });

        // Para cada board vinculado ao projeto, adiciona a tarefa
        for (const board of kanbanBoards) {
          if (board.columns.length > 0) {
            const firstColumn = board.columns[0];
            const { mapTaskStatusToKanbanStatus } = await import("@/lib/kanban/task-mapper");
            
            // Encontra a coluna correspondente ao status da tarefa
            const kanbanStatus = mapTaskStatusToKanbanStatus(task.status);
            const targetColumn = board.columns.find((col) => col.status === kanbanStatus) || firstColumn;

            // Verifica se já existe um card para essa tarefa neste board
            const existingCard = await prisma.kanbanCard.findFirst({
              where: {
                boardId: board.id,
                taskId: task.id,
              },
            });

            if (!existingCard) {
              // Calcula a ordem
              const lastCard = await prisma.kanbanCard.findFirst({
                where: { columnId: targetColumn.id },
                orderBy: { order: "desc" },
                select: { order: true },
              });

              const order = lastCard ? lastCard.order + 1 : 0;

              // Pega o primeiro assignee (se houver)
              const firstAssignee = task.assignees[0]?.user;

              // Cria o card
              await prisma.kanbanCard.create({
                data: {
                  boardId: board.id,
                  columnId: targetColumn.id,
                  taskId: task.id,
                  title: task.title,
                  description: task.description,
                  priority: task.priority,
                  dueDate: null,
                  tags: [],
                  assigneeId: firstAssignee?.id,
                  order,
                },
              });
            }
          }
        }
      }
    } catch (kanbanError) {
      // Log do erro mas não falha a criação da tarefa
      console.error("Erro ao sincronizar tarefa com Kanban:", kanbanError);
    }

    // Criar notificações (fora da transação para não bloquear)
    const notificationPromises: Promise<any>[] = [];

    // Notificar o criador da tarefa sobre a criação (apenas se houver projeto)
    if (project) {
      notificationPromises.push(
        notifyTaskCreated(
          task.id,
          task.title,
          project.id,
          project.name,
          user.id,
          user.name,
          project.createdById
        )
      );

      // Notificar criador do projeto sobre nova tarefa (apenas se diferente do criador da tarefa)
      if (project.createdById && project.createdById !== user.id) {
        notificationPromises.push(
          notifyProjectTaskAdded(
            project.id,
            project.name,
            task.id,
            task.title,
            project.createdById,
            user.id
          )
        );
      }
    }

    // Notificar assignees (apenas se não forem o criador da tarefa)
    for (const assignee of task.assignees) {
      if (assignee.user.id !== user.id) {
        notificationPromises.push(
          notifyTaskAssigned(
            task.id,
            task.title,
            project?.id || null,
            project?.name || null,
            assignee.user.id
          )
        );
      }
    }

    if (notificationPromises.length > 0) {
      Promise.all(notificationPromises).catch((err) => {
        // Ignorar erros de notificação para não quebrar o fluxo principal
        console.error("Erro ao criar notificações:", err);
      });
    }

    // Calcular loggedHours (soma dos timeEntries)
    const loggedHours = task.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );

    // Transformar para formato TaskListItem
    const taskListItem = {
      id: task.id,
      title: task.title,
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      unit: task.unit,
      status: task.status,
      priority: task.priority,
      assignees: task.assignees.map((ta) => ({
        id: ta.user.id,
        name: ta.user.name,
      })),
      estimatedHours: task.estimatedHours,
      loggedHours,
      updatedAt: task.updatedAt.toISOString(),
    };

    return NextResponse.json({ task: taskListItem }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar tarefa" },
      { status: 500 }
    );
  }
}

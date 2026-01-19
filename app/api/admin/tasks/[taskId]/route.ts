import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TaskStatus, TaskPriority, TaskUnit } from "@/lib/generated/prisma/enums"
import { z } from "zod"
import {
  notifyTaskStatusChanged,
  notifyTaskUpdated,
  notifyTaskAssigned,
} from "@/lib/notifications"

/**
 * Schema de validação para atualização de tarefa
 */
const updateTaskSchema = z.object({
  projectId: z.string().min(1).optional(),
  unit: z.nativeEnum(TaskUnit).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeIds: z.array(z.string().min(1)).optional(),
  estimatedHours: z.number().int().min(0).optional(),
  acceptance: z.string().optional().nullable(),
})

/**
 * GET /api/admin/tasks/:taskId
 * Busca uma tarefa específica pelo ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver tarefas." },
        { status: 403 }
      )
    }

    const { taskId } = await params

    // Buscar tarefa com relacionamentos
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" },
        { status: 404 }
      )
    }

    // Calcular loggedHours (soma dos timeEntries)
    const loggedHours = task.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    )

    // Transformar para formato TaskListItem
    const taskListItem = {
      id: task.id,
      title: task.title,
      description: task.description || null,
      acceptance: task.acceptance || null,
      project: {
        id: task.project.id,
        name: task.project.name,
      },
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
    }

    return NextResponse.json(taskListItem)
  } catch (error: any) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar tarefa" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/tasks/:taskId
 * Atualiza uma tarefa
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem atualizar tarefas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar tarefas." },
        { status: 403 }
      )
    }

    const { taskId } = await params
    const body = await req.json()
    const parsed = updateTaskSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]
      const errorMessage = firstError?.message || "Dados inválidos"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const updateData = parsed.data

    // Buscar tarefa atual para comparar mudanças
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        createdBy: {
          select: {
            id: true,
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
      },
    })

    if (!currentTask) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o projeto existe (se foi alterado)
    if (updateData.projectId && updateData.projectId !== currentTask.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId },
      })

      if (!project) {
        return NextResponse.json(
          { error: "Projeto não encontrado" },
          { status: 404 }
        )
      }
    }

    // Verificar se os assignees existem (se foram alterados)
    if (updateData.assigneeIds) {
      const assignees = await prisma.user.findMany({
        where: { id: { in: updateData.assigneeIds } },
        select: { id: true },
      })

      if (assignees.length !== updateData.assigneeIds.length) {
        return NextResponse.json(
          { error: "Um ou mais responsáveis não foram encontrados" },
          { status: 400 }
        )
      }
    }

    // Preparar dados de atualização
    const taskUpdateData: any = {}

    if (updateData.projectId !== undefined) {
      taskUpdateData.projectId = updateData.projectId
    }
    if (updateData.unit !== undefined) {
      taskUpdateData.unit = updateData.unit
    }
    if (updateData.status !== undefined) {
      taskUpdateData.status = updateData.status
      // Se status virou DONE → completedAt = now()
      // Se saiu de DONE → completedAt = null
      if (updateData.status === TaskStatus.DONE && currentTask.status !== TaskStatus.DONE) {
        taskUpdateData.completedAt = new Date()
      } else if (currentTask.status === TaskStatus.DONE && updateData.status !== TaskStatus.DONE) {
        taskUpdateData.completedAt = null
      }
    }
    if (updateData.priority !== undefined) {
      taskUpdateData.priority = updateData.priority
    }
    if (updateData.estimatedHours !== undefined) {
      taskUpdateData.estimatedHours = updateData.estimatedHours
    }
    if (updateData.acceptance !== undefined) {
      taskUpdateData.acceptance = updateData.acceptance
    }

    // Atualizar tarefa e assignees em uma transação
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Atualizar assignees se necessário
      if (updateData.assigneeIds !== undefined) {
        // Remover assignees antigos
        await tx.taskAssignee.deleteMany({
          where: { taskId },
        })

        // Adicionar novos assignees
        if (updateData.assigneeIds.length > 0) {
          await tx.taskAssignee.createMany({
            data: updateData.assigneeIds.map((userId) => ({
              taskId,
              userId,
            })),
          })
        }
      }

      // Atualizar tarefa
      const task = await tx.task.update({
        where: { id: taskId },
        data: taskUpdateData,
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
      })

      // Registrar eventos de atividade granular
      const activityEvents: Array<{
        type: string
        message: string
        meta?: any
      }> = []

      // Status mudou
      if (updateData.status !== undefined && updateData.status !== currentTask.status) {
        const statusLabels: Record<TaskStatus, string> = {
          BACKLOG: "Backlog",
          TODO: "To Do",
          IN_PROGRESS: "Em Progresso",
          BLOCKED: "Bloqueada",
          DONE: "Concluída",
        }
        activityEvents.push({
          type: "TASK_STATUS_CHANGED",
          message: `${user.name} alterou o status de "${statusLabels[currentTask.status]}" para "${statusLabels[updateData.status]}"`,
          meta: {
            from: currentTask.status,
            to: updateData.status,
          },
        })
      }

      // Assignees mudaram
      if (updateData.assigneeIds !== undefined) {
        const currentAssigneeIds = currentTask.assignees.map((a) => a.user.id).sort()
        const newAssigneeIds = [...updateData.assigneeIds].sort()
        const idsChanged = JSON.stringify(currentAssigneeIds) !== JSON.stringify(newAssigneeIds)

        if (idsChanged) {
          const currentNames = currentTask.assignees.map((a) => a.user.name).join(", ") || "Nenhum"
          const newNames = updateData.assigneeIds.length > 0
            ? (await tx.user.findMany({
                where: { id: { in: updateData.assigneeIds } },
                select: { name: true },
              })).map((u) => u.name).join(", ")
            : "Nenhum"

          activityEvents.push({
            type: "TASK_ASSIGNEES_CHANGED",
            message: `${user.name} alterou os responsáveis de "${currentNames}" para "${newNames}"`,
            meta: {
              from: currentAssigneeIds,
              to: updateData.assigneeIds,
            },
          })
        }
      }

      // Projeto mudou
      if (updateData.projectId !== undefined && updateData.projectId !== currentTask.projectId) {
        const newProject = await tx.project.findUnique({
          where: { id: updateData.projectId },
          select: { name: true },
        })
        activityEvents.push({
          type: "TASK_UPDATED",
          message: `${user.name} alterou o projeto de "${currentTask.project.name}" para "${newProject?.name || "Desconhecido"}"`,
          meta: {
            field: "project",
            from: currentTask.project.name,
            to: newProject?.name,
          },
        })
      }

      // Unidade mudou
      if (updateData.unit !== undefined && updateData.unit !== currentTask.unit) {
        const unitLabels: Record<TaskUnit, string> = {
          ITJ: "ITJ",
          SFS: "SFS",
          FOZ: "FOZ",
          DIO: "DIO",
          AOL: "AOL",
        }
        activityEvents.push({
          type: "TASK_UPDATED",
          message: `${user.name} alterou a unidade de "${unitLabels[currentTask.unit]}" para "${unitLabels[updateData.unit]}"`,
          meta: {
            field: "unit",
            from: currentTask.unit,
            to: updateData.unit,
          },
        })
      }

      // Prioridade mudou
      if (updateData.priority !== undefined && updateData.priority !== currentTask.priority) {
        const priorityLabels: Record<TaskPriority, string> = {
          LOW: "Baixa",
          MEDIUM: "Média",
          HIGH: "Alta",
          URGENT: "Urgente",
        }
        activityEvents.push({
          type: "TASK_UPDATED",
          message: `${user.name} alterou a prioridade de "${priorityLabels[currentTask.priority]}" para "${priorityLabels[updateData.priority]}"`,
          meta: {
            field: "priority",
            from: currentTask.priority,
            to: updateData.priority,
          },
        })
      }

      // Horas estimadas mudaram
      if (updateData.estimatedHours !== undefined && updateData.estimatedHours !== currentTask.estimatedHours) {
        activityEvents.push({
          type: "TASK_UPDATED",
          message: `${user.name} alterou as horas estimadas de ${currentTask.estimatedHours}h para ${updateData.estimatedHours}h`,
          meta: {
            field: "estimatedHours",
            from: currentTask.estimatedHours,
            to: updateData.estimatedHours,
          },
        })
      }

      // Criar eventos de atividade
      for (const event of activityEvents) {
        await tx.taskActivityEvent.create({
          data: {
            taskId,
            type: event.type as any,
            actorId: user.id,
            message: event.message,
            meta: event.meta || {},
          },
        })
      }

      return task
    })

    // Criar notificações (fora da transação para não bloquear)
    const notificationPromises: Promise<any>[] = []

    // Notificar mudança de status
    if (updateData.status !== undefined && updateData.status !== currentTask.status) {
      const statusLabels: Record<TaskStatus, string> = {
        BACKLOG: "Backlog",
        TODO: "To Do",
        IN_PROGRESS: "Em Progresso",
        BLOCKED: "Bloqueada",
        DONE: "Concluída",
      }
      notificationPromises.push(
        notifyTaskStatusChanged(
          updatedTask.id,
          updatedTask.title,
          updatedTask.project.id,
          updatedTask.project.name,
          statusLabels[currentTask.status],
          statusLabels[updateData.status],
          currentTask.createdBy?.id || null,
          currentTask.project.createdById || null,
          user.id
        )
      )
    }

    // Notificar atualização geral (se não foi apenas mudança de status)
    if (
      (updateData.priority !== undefined && updateData.priority !== currentTask.priority) ||
      (updateData.unit !== undefined && updateData.unit !== currentTask.unit) ||
      (updateData.estimatedHours !== undefined && updateData.estimatedHours !== currentTask.estimatedHours) ||
      (updateData.projectId !== undefined && updateData.projectId !== currentTask.projectId)
    ) {
      notificationPromises.push(
        notifyTaskUpdated(
          updatedTask.id,
          updatedTask.title,
          updatedTask.project.id,
          updatedTask.project.name,
          currentTask.createdBy?.id || null,
          currentTask.project.createdById || null,
          user.id
        )
      )
    }

    // Notificar novos assignees
    if (updateData.assigneeIds !== undefined) {
      const currentAssigneeIds = currentTask.assignees.map((a) => a.user.id)
      const newAssigneeIds = updateData.assigneeIds
      const newAssignees = newAssigneeIds.filter((id) => !currentAssigneeIds.includes(id))

      for (const assigneeId of newAssignees) {
        notificationPromises.push(
          notifyTaskAssigned(
            updatedTask.id,
            updatedTask.title,
            updatedTask.project.id,
            updatedTask.project.name,
            assigneeId
          )
        )
      }
    }

    Promise.all(notificationPromises).catch((err) => {
      // Ignorar erros de notificação para não quebrar o fluxo principal
      console.error("Erro ao criar notificações:", err)
    })

    // Sincronizar com Kanban: se o status mudou, atualiza o card correspondente
    if (updateData.status !== undefined && updateData.status !== currentTask.status) {
      try {
        const { mapTaskStatusToKanbanStatus } = await import("@/lib/kanban/task-mapper")
        
        // Busca todos os cards vinculados a esta tarefa
        const kanbanCards = await prisma.kanbanCard.findMany({
          where: {
            taskId: taskId,
          },
          include: {
            board: {
              include: {
                columns: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        })

        // Para cada card, move para a coluna correspondente ao novo status
        for (const card of kanbanCards) {
          const kanbanStatus = mapTaskStatusToKanbanStatus(updateData.status)
          const targetColumn = card.board.columns.find((col) => col.status === kanbanStatus)

          if (targetColumn && targetColumn.id !== card.columnId) {
            // Calcula a nova ordem na coluna destino
            const lastCard = await prisma.kanbanCard.findFirst({
              where: { columnId: targetColumn.id },
              orderBy: { order: "desc" },
              select: { order: true },
            })

            const newOrder = lastCard ? lastCard.order + 1 : 0

            // Atualiza o card
            await prisma.kanbanCard.update({
              where: { id: card.id },
              data: {
                columnId: targetColumn.id,
                order: newOrder,
              },
            })
          }
        }
      } catch (kanbanError) {
        // Log do erro mas não falha a atualização da tarefa
        console.error("Erro ao sincronizar tarefa com Kanban:", kanbanError)
      }
    }

    // Calcular loggedHours (soma dos timeEntries)
    const loggedHours = updatedTask.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    )

    // Transformar para formato TaskListItem
    const taskListItem = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || null,
      acceptance: updatedTask.acceptance || null,
      project: {
        id: updatedTask.project.id,
        name: updatedTask.project.name,
      },
      unit: updatedTask.unit,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assignees: updatedTask.assignees.map((ta) => ({
        id: ta.user.id,
        name: ta.user.name,
      })),
      estimatedHours: updatedTask.estimatedHours,
      loggedHours,
      updatedAt: updatedTask.updatedAt.toISOString(),
    }

    return NextResponse.json({ task: taskListItem })
  } catch (error: any) {
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar tarefa" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/tasks/:taskId/activity
 * Lista eventos de atividade de uma tarefa
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver atividade." },
        { status: 403 }
      )
    }

    const { taskId } = await params

    // Verificar se a tarefa existe
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" },
        { status: 404 }
      )
    }

    // Buscar eventos de atividade com informações do ator
    const activityEvents = await prisma.taskActivityEvent.findMany({
      where: { taskId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transformar para formato esperado pelo frontend
    const events = activityEvents.map((event) => ({
      id: event.id,
      taskId: event.taskId,
      type: event.type,
      actor: {
        id: event.actor.id,
        name: event.actor.name,
      },
      createdAt: event.createdAt.toISOString(),
      message: event.message,
      meta: event.meta || undefined,
    }))

    return NextResponse.json(events)
  } catch (error: any) {
    console.error("Erro ao buscar atividade:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar atividade" },
      { status: 500 }
    )
  }
}

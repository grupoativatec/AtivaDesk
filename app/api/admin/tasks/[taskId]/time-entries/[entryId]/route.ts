import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TaskStatus } from "@/lib/generated/prisma/enums"

/**
 * DELETE /api/admin/tasks/:taskId/time-entries/:entryId
 * Remove um apontamento
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ taskId: string; entryId: string }> }
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
        { error: "Acesso negado. Apenas administradores podem excluir apontamentos." },
        { status: 403 }
      )
    }

    const { taskId, entryId } = await params

    // Buscar tarefa e verificar status
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, status: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarefa não encontrada" },
        { status: 404 }
      )
    }

    // Buscar apontamento
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        taskId: true,
        hours: true,
        type: true,
        date: true,
      },
    })

    if (!timeEntry) {
      return NextResponse.json(
        { error: "Apontamento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o apontamento pertence à tarefa
    if (timeEntry.taskId !== taskId) {
      return NextResponse.json(
        { error: "Apontamento não pertence a esta tarefa" },
        { status: 400 }
      )
    }

    // Bloquear se tarefa está DONE
    if (task.status === TaskStatus.DONE) {
      return NextResponse.json(
        { error: "Não é possível excluir horas de uma tarefa concluída" },
        { status: 400 }
      )
    }

    // Excluir apontamento e criar evento de atividade em uma transação
    await prisma.$transaction(async (tx) => {
      // Excluir apontamento
      await tx.timeEntry.delete({
        where: { id: entryId },
      })

      // Registrar evento de atividade
      await tx.taskActivityEvent.create({
        data: {
          taskId,
          type: "TIME_ENTRY_DELETED",
          actorId: user.id,
          message: `${user.name} removeu ${Number(timeEntry.hours)}h apontadas em ${timeEntry.date.toLocaleDateString("pt-BR")} (${timeEntry.type})`,
          meta: {
            entryId,
            hours: Number(timeEntry.hours),
            type: timeEntry.type,
            date: timeEntry.date.toISOString().split("T")[0],
          },
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir apontamento:", error)
    return NextResponse.json(
      { error: "Erro interno ao excluir apontamento" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TaskStatus, TimeEntryType } from "@/lib/generated/prisma/enums"
import { z } from "zod"

/**
 * Schema de validação para criação de apontamento
 */
const createTimeEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  hours: z.number().positive("Horas devem ser positivas").max(24, "Máximo 24 horas por dia"),
  type: z.nativeEnum(TimeEntryType),
  note: z.string().optional(),
})

/**
 * GET /api/admin/tasks/:taskId/time-entries
 * Lista apontamentos de uma tarefa
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
        { error: "Acesso negado. Apenas administradores podem ver apontamentos." },
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

    // Buscar apontamentos com informações do usuário
    const timeEntries = await prisma.timeEntry.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    // Transformar para formato esperado pelo frontend
    const entries = timeEntries.map((entry) => ({
      id: entry.id,
      taskId: entry.taskId,
      userId: entry.userId,
      userName: entry.user.name,
      date: entry.date.toISOString().split("T")[0], // YYYY-MM-DD
      hours: Number(entry.hours),
      type: entry.type,
      note: entry.note || undefined,
      createdAt: entry.createdAt.toISOString(),
    }))

    return NextResponse.json(entries)
  } catch (error: any) {
    console.error("Erro ao buscar apontamentos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar apontamentos" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/tasks/:taskId/time-entries
 * Cria um novo apontamento
 */
export async function POST(
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
        { error: "Acesso negado. Apenas administradores podem criar apontamentos." },
        { status: 403 }
      )
    }

    const { taskId } = await params
    const body = await req.json()
    const parsed = createTimeEntrySchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]
      const errorMessage = firstError?.message || "Dados inválidos"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    const { date, hours, type, note } = parsed.data

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

    // Bloquear se tarefa está DONE
    if (task.status === TaskStatus.DONE) {
      return NextResponse.json(
        { error: "Não é possível lançar horas em uma tarefa concluída" },
        { status: 400 }
      )
    }

    // Criar apontamento e evento de atividade em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar apontamento
      const timeEntry = await tx.timeEntry.create({
        data: {
          taskId,
          userId: user.id,
          date: new Date(date),
          hours,
          type,
          note,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Registrar evento de atividade
      await tx.taskActivityEvent.create({
        data: {
          taskId,
          type: "TIME_ENTRY_ADDED",
          actorId: user.id,
          message: `${user.name} apontou ${hours}h em ${new Date(date).toLocaleDateString("pt-BR")} (${type})`,
          meta: {
            entryId: timeEntry.id,
            hours,
            type,
            date,
          },
        },
      })

      return timeEntry
    })

    // Transformar para formato esperado pelo frontend
    const entry = {
      id: result.id,
      taskId: result.taskId,
      userId: result.userId,
      userName: result.user.name,
      date: result.date.toISOString().split("T")[0], // YYYY-MM-DD
      hours: Number(result.hours),
      type: result.type,
      note: result.note || undefined,
      createdAt: result.createdAt.toISOString(),
    }

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar apontamento:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar apontamento" },
      { status: 500 }
    )
  }
}

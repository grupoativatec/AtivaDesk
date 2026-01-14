import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

const toggleTimerSchema = z.object({
  action: z.enum(["pause", "resume"]),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem pausar/retomar o timer
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem pausar/retomar o timer." },
        { status: 403 }
      )
    }

    const { id: ticketId } = await params
    const body = await req.json()
    const parsed = toggleTimerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { action } = parsed.data

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Apenas tickets em andamento podem ter o timer pausado/retomado
    if (ticket.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Apenas tickets em andamento podem ter o timer pausado/retomado" },
        { status: 400 }
      )
    }

    if (!ticket.inProgressAt) {
      return NextResponse.json(
        { error: "Timer não foi iniciado para este ticket" },
        { status: 400 }
      )
    }

    const updateData: any = {}
    const now = new Date()

    if (action === "pause") {
      // Se já está pausado, não fazer nada
      if (ticket.timerPaused) {
        return NextResponse.json({
          ok: true,
          message: "Timer já está pausado",
          ticket,
        })
      }

      // Calcular quanto tempo ficou ativo desde a última retomada (ou desde o início)
      // Se havia uma pausa anterior, precisamos calcular o tempo desde a última retomada
      // Por enquanto, vamos simplesmente marcar como pausado
      updateData.timerPaused = true
      updateData.timerPausedAt = now
    } else if (action === "resume") {
      // Se não está pausado, não fazer nada
      if (!ticket.timerPaused) {
        return NextResponse.json({
          ok: true,
          message: "Timer já está em execução",
          ticket,
        })
      }

      // Calcular quanto tempo ficou pausado e adicionar ao total
      if (ticket.timerPausedAt) {
        const pausedAt = new Date(ticket.timerPausedAt)
        const pausedMs = now.getTime() - pausedAt.getTime()
        // Calcular em segundos para preservar precisão
        const pausedSeconds = Math.floor(pausedMs / 1000)
        updateData.totalPausedSeconds = (ticket.totalPausedSeconds || 0) + pausedSeconds
      }

      updateData.timerPaused = false
      updateData.timerPausedAt = null
    }

    // Atualizar o ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        attachments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      ticket: updatedTicket,
    })
  } catch (error: any) {
    console.error("Erro ao pausar/retomar timer:", error)
    return NextResponse.json(
      { error: "Erro interno ao pausar/retomar timer" },
      { status: 500 }
    )
  }
}

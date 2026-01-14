import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["HARDWARE", "SOFTWARE", "NETWORK", "EMAIL", "ACCESS", "OTHER"]).optional(),
  unit: z.enum(["ITJ", "SFS", "FOZ", "DIO", "AOL"]).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
})

export async function GET(
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

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver todos os tickets." },
        { status: 403 }
      )
    }

    const { id: ticketId } = await params

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
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

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      ticket,
    })
  } catch (error: any) {
    console.error("Erro ao buscar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar ticket" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Apenas admins podem atualizar tickets
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar tickets." },
        { status: 403 }
      )
    }

    const { id: ticketId } = await params
    const body = await req.json()
    const parsed = updateTicketSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data

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

    // Se está atribuindo a um admin, verificar se o usuário existe e é admin
    if (data.assigneeId !== undefined) {
      if (data.assigneeId !== null) {
        const assignee = await prisma.user.findUnique({
          where: { id: data.assigneeId },
        })

        if (!assignee) {
          return NextResponse.json(
            { error: "Usuário não encontrado" },
            { status: 404 }
          )
        }

        if (assignee.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Apenas administradores podem ser atribuídos a tickets" },
            { status: 400 }
          )
        }
      }
    }

    // Preparar dados de atualização
    const updateData: any = {}

    if (data.status !== undefined) {
      updateData.status = data.status
      
      // Se está mudando para IN_PROGRESS, registrar quando começou
      if (data.status === "IN_PROGRESS" && ticket.status !== "IN_PROGRESS" && !ticket.inProgressAt) {
        updateData.inProgressAt = new Date()
      }
      
      // Se está resolvendo ou fechando, calcular tempo dedicado
      if ((data.status === "RESOLVED" || data.status === "CLOSED") && 
          ticket.status === "IN_PROGRESS" && 
          ticket.inProgressAt) {
        const startTime = new Date(ticket.inProgressAt)
        const endTime = new Date()
        const diffMs = endTime.getTime() - startTime.getTime()
        let diffSeconds = Math.floor(diffMs / 1000)
        
        // Subtrair o tempo total pausado (em segundos)
        const totalPausedSeconds = ticket.totalPausedSeconds || 0
        
        // Se está pausado no momento, calcular quanto tempo ficou pausado até agora
        if (ticket.timerPaused && ticket.timerPausedAt) {
          const pausedAt = new Date(ticket.timerPausedAt)
          const pausedMs = endTime.getTime() - pausedAt.getTime()
          const currentPausedSeconds = Math.floor(pausedMs / 1000)
          diffSeconds -= (totalPausedSeconds + currentPausedSeconds)
        } else {
          diffSeconds -= totalPausedSeconds
        }
        
        // Garantir que não seja negativo
        diffSeconds = Math.max(0, diffSeconds)
        
        // Converter para minutos
        let diffMinutes = Math.floor(diffSeconds / 60)
        
        // Garantir que não seja negativo
        diffMinutes = Math.max(0, diffMinutes)
        
        updateData.timeSpentMinutes = diffMinutes
        
        if (data.status === "RESOLVED" && ticket.status !== "RESOLVED") {
          updateData.resolvedAt = new Date()
        }
        if (data.status === "CLOSED" && ticket.status !== "CLOSED") {
          updateData.closedAt = new Date()
        }
      }
    }

    if (data.priority !== undefined) {
      updateData.priority = data.priority
    }

    if (data.category !== undefined) {
      updateData.category = data.category
    }

    if (data.unit !== undefined) {
      updateData.unit = data.unit
    }

    if (data.assigneeId !== undefined) {
      updateData.assigneeId = data.assigneeId
      // Se está atribuindo e o status é OPEN, mudar para IN_PROGRESS e iniciar cronômetro
      if (data.assigneeId !== null && ticket.status === "OPEN") {
        updateData.status = "IN_PROGRESS"
        if (!ticket.inProgressAt) {
          updateData.inProgressAt = new Date()
        }
      }
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
    console.error("Erro ao atualizar ticket:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar ticket" },
      { status: 500 }
    )
  }
}

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
  teamId: z.string().nullable().optional(), // Equipe responsável
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
        team: {
          select: {
            id: true,
            name: true,
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
        { error: parsed.error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }

    const data = parsed.data

    console.log("Dados recebidos para atualização:", data)

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

    // Verificar se a equipe existe (se foi atribuída)
    let teamMembers: string[] = []
    if (data.teamId !== undefined && data.teamId !== null) {
      console.log("Buscando equipe:", data.teamId)
      const team = await prisma.team.findUnique({
        where: { id: data.teamId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  role: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      })

      if (!team) {
        console.error("Equipe não encontrada:", data.teamId)
        return NextResponse.json(
          { error: "Equipe não encontrada" },
          { status: 404 }
        )
      }

      console.log("Equipe encontrada:", { id: team.id, name: team.name, membersCount: team.members.length })

      // Obter IDs dos membros ativos da equipe
      teamMembers = team.members
        .filter((m) => !m.user.deletedAt && m.user.role === "ADMIN")
        .map((m) => m.user.id)
      
      console.log("Membros da equipe:", teamMembers)
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
        
        if (data.status === "RESOLVED") {
          updateData.resolvedAt = new Date()
        }
        if (data.status === "CLOSED") {
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

    if (data.teamId !== undefined) {
      // Sempre atualizar teamId, mesmo se for null (para remover equipe)
      // Usar sintaxe explícita para garantir que null seja setado corretamente
      if (data.teamId === null) {
        updateData.teamId = null
      } else {
        updateData.teamId = data.teamId
      }
      console.log("Atualizando teamId:", { 
        valor: data.teamId, 
        tipo: typeof data.teamId,
        ticketAtual: ticket.teamId 
      })
      
      // Se está atribuindo uma equipe e o status é OPEN, mudar para IN_PROGRESS
      if (data.teamId !== null && ticket.status === "OPEN") {
        updateData.status = "IN_PROGRESS"
        if (!ticket.inProgressAt) {
          updateData.inProgressAt = new Date()
        }
      }
    }

    console.log("Dados de atualização preparados:", updateData)

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
        team: {
          select: {
            id: true,
            name: true,
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

    console.log("Ticket atualizado:", {
      id: updatedTicket.id,
      teamId: updatedTicket.teamId,
      team: updatedTicket.team,
    })

    // Notificar membros da equipe se uma equipe foi atribuída
    if (data.teamId !== undefined && data.teamId !== null && teamMembers.length > 0) {
      const { notifyTicketAssigned } = await import("@/lib/notifications")
      
      // Notificar todos os membros da equipe
      Promise.all(
        teamMembers.map((memberId) =>
          notifyTicketAssigned(
            ticketId,
            ticket.title,
            memberId
          )
        )
      ).catch((err) => {
        console.error("Erro ao notificar membros da equipe:", err)
      })
    }
    
    // Notificar assignee individual apenas se não foi atribuído via equipe
    if (data.assigneeId !== undefined && data.assigneeId !== null && (data.teamId === undefined || data.teamId === null)) {
      const { notifyTicketAssigned } = await import("@/lib/notifications")
      notifyTicketAssigned(
        ticketId,
        ticket.title,
        data.assigneeId
      ).catch((err) => {
        console.error("Erro ao notificar assignee:", err)
      })
    }

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

export async function DELETE(
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

    // Apenas admins podem excluir tickets
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem excluir tickets." },
        { status: 403 }
      )
    }

    const { id: ticketId } = await params

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
      },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Excluir ticket
    // O Prisma vai excluir automaticamente os relacionamentos (messages, attachments, notifications)
    // devido ao onDelete: Cascade no schema
    await prisma.ticket.delete({
      where: { id: ticketId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir ticket:", error)
    return NextResponse.json(
      { error: "Erro interno ao excluir ticket" },
      { status: 500 }
    )
  }
}

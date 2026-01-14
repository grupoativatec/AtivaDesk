import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

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

    // Apenas admins podem assumir tickets
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem assumir tickets." },
        { status: 403 }
      )
    }

    const { id } = await params

    // Verificar se o ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar o ticket: atribuir ao admin e mudar status para IN_PROGRESS se estiver OPEN
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        assigneeId: user.id,
        status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
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
      },
    })

    return NextResponse.json({
      ok: true,
      ticket: updatedTicket,
    })
  } catch (error: any) {
    console.error("Erro ao assumir ticket:", error)
    return NextResponse.json(
      { error: "Erro interno ao assumir ticket" },
      { status: 500 }
    )
  }
}

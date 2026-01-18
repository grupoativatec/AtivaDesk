import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

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

    const { id: ticketId } = await params

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        openedById: user.id, // Apenas tickets do próprio usuário
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
          where: {
            isInternal: false, // Apenas mensagens visíveis para o usuário
          },
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

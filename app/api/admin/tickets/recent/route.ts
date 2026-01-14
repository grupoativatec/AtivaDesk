import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET() {
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
        { error: "Acesso negado. Apenas administradores podem ver tickets recentes." },
        { status: 403 }
      )
    }

    // Buscar os últimos 5 tickets atribuídos a este admin
    const tickets = await prisma.ticket.findMany({
      where: {
        assigneeId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        url: `/admin/tickets/${ticket.id}`,
        updatedAt: ticket.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error("Erro ao buscar tickets recentes:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar tickets recentes" },
      { status: 500 }
    )
  }
}

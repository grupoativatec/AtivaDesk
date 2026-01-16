import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem marcar notificações como lidas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem gerenciar notificações." },
        { status: 403 }
      )
    }

    // Marcar todas as notificações não lidas como lidas
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      ok: true,
      count: result.count,
    })
  } catch (error: any) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return NextResponse.json(
      { error: "Erro interno ao marcar notificações como lidas" },
      { status: 500 }
    )
  }
}

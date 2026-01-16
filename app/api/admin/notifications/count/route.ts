import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem ver contagem de notificações
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver notificações." },
        { status: 403 }
      )
    }

    // Contar notificações não lidas
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        status: "UNREAD",
      },
    })

    return NextResponse.json({
      ok: true,
      count: unreadCount,
    })
  } catch (error: any) {
    console.error("Erro ao contar notificações:", error)
    return NextResponse.json(
      { error: "Erro interno ao contar notificações" },
      { status: 500 }
    )
  }
}

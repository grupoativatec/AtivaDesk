import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

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

    // Apenas admins podem marcar notificações como lidas
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem gerenciar notificações." },
        { status: 403 }
      )
    }

    const { id: notificationId } = await params

    // Verificar se a notificação existe e pertence ao usuário
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      )
    }

    // Marcar como lida
    const updated = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      ok: true,
      notification: updated,
    })
  } catch (error: any) {
    console.error("Erro ao marcar notificação como lida:", error)
    return NextResponse.json(
      { error: "Erro interno ao marcar notificação como lida" },
      { status: 500 }
    )
  }
}

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

    // Apenas admins podem ver notificações
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver notificações." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // "READ" | "UNREAD" | null (todas)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Construir filtro
    const where: any = {
      userId: user.id,
    }

    if (status === "READ" || status === "UNREAD") {
      where.status = status
    }

    // Buscar notificações
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          ticket: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      ok: true,
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar notificações" },
      { status: 500 }
    )
  }
}

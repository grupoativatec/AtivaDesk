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

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver usuários." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") // Opcional: filtrar por role

    const where: any = {}
    if (role) {
      where.role = role
    } else {
      // Por padrão, apenas admins
      where.role = "ADMIN"
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      ok: true,
      users,
    })
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar usuários" },
      { status: 500 }
    )
  }
}

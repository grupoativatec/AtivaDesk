import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * GET /api/admin/projects
 * Lista todos os projetos (apenas ativos por padrão)
 */
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
        { error: "Acesso negado. Apenas administradores podem ver projetos." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // "ACTIVE" | "ARCHIVED" | null (todos)

    const where: any = {}
    if (status === "ACTIVE" || status === "ARCHIVED") {
      where.status = status
    } else {
      // Por padrão, apenas projetos ativos
      where.status = "ACTIVE"
    }

    // Buscar projetos
    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        unit: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
        unit: p.unit,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    )
  } catch (error: any) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar projetos" },
      { status: 500 }
    )
  }
}

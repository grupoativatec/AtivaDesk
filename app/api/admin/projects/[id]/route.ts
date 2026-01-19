import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"
import { Prisma } from "@/lib/generated/prisma/client"
/**
 * GET /api/admin/projects/:id
 * Busca um projeto específico pelo ID + métricas (totalHours)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver projetos." },
        { status: 403 }
      )
    }

    const { id } = await params

    const [project, hoursAgg] = await Promise.all([
      prisma.project.findUnique({
        where: { id },
        include: {
          _count: { select: { tasks: true } },
        },
      }),
      prisma.timeEntry.aggregate({
        where: {
          task: { projectId: id },
        },
        _sum: { hours: true },
      }),
    ])

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    const totalHoursDecimal = hoursAgg._sum.hours ?? new Prisma.Decimal(0)

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        unit: project.unit,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        _count: {
          tasks: project._count.tasks,
        },
      },
      metrics: {
        totalHours: totalHoursDecimal.toNumber(), // ✅ número (exibição fácil)
        // se preferir precisão: totalHours: totalHoursDecimal.toString(),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar projeto:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar projeto" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

const createTeamSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver equipes." },
        { status: 403 }
      )
    }

    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({
      ok: true,
      teams,
    })
  } catch (error: any) {
    console.error("Erro ao buscar equipes:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar equipes" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar equipes." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createTeamSchema.parse(body)

    const team = await prisma.team.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      team,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("Erro ao criar equipe:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar equipe" },
      { status: 500 }
    )
  }
}

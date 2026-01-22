import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem modificar equipes." },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = updateTeamSchema.parse(body)

    const team = await prisma.team.findUnique({
      where: { id },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: validatedData,
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
      team: updatedTeam,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }
    console.error("Erro ao atualizar equipe:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar equipe" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem remover equipes." },
        { status: 403 }
      )
    }

    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    await prisma.team.delete({
      where: { id },
    })

    return NextResponse.json({
      ok: true,
      message: "Equipe removida com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao remover equipe:", error)
    return NextResponse.json(
      { error: "Erro interno ao remover equipe" },
      { status: 500 }
    )
  }
}

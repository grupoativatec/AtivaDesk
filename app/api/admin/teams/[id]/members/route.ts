import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

const addMemberSchema = z.object({
  userId: z.string().min(1, "ID do usuário é obrigatório"),
})

export async function POST(
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
        { error: "Acesso negado. Apenas administradores podem gerenciar membros de equipe." },
        { status: 403 }
      )
    }

    const { id: teamId } = await params
    const body = await req.json()
    const { userId } = addMemberSchema.parse(body)

    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o usuário existe e é ADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        deletedAt: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (targetUser.deletedAt) {
      return NextResponse.json(
        { error: "Não é possível adicionar um usuário removido à equipe" },
        { status: 400 }
      )
    }

    // REGRA DE NEGÓCIO: Apenas ADMINs podem ser membros de equipe
    if (targetUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas usuários com cargo de Administrador podem ser atribuídos a equipes" },
        { status: 400 }
      )
    }

    // Verificar se o usuário já é membro
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro desta equipe" },
        { status: 400 }
      )
    }

    await prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
    })

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
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
      message: "Membro adicionado com sucesso",
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Dados inválidos" },
        { status: 400 }
      )
    }
    console.error("Erro ao adicionar membro:", error)
    return NextResponse.json(
      { error: "Erro interno ao adicionar membro" },
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
        { error: "Acesso negado. Apenas administradores podem remover membros de equipe." },
        { status: 403 }
      )
    }

    const { id: teamId } = await params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    // Verificar se a equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Equipe não encontrada" },
        { status: 404 }
      )
    }

    // Verificar se o membro existe
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Membro não encontrado nesta equipe" },
        { status: 404 }
      )
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    })

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
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
      message: "Membro removido com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao remover membro:", error)
    return NextResponse.json(
      { error: "Erro interno ao remover membro" },
      { status: 500 }
    )
  }
}

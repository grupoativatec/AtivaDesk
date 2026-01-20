import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { UserRole } from "@/lib/generated/prisma/enums"

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
        { error: "Acesso negado. Apenas administradores podem modificar usuários." },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { role, active } = body

    // Validar que o usuário existe e não está deletado
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (targetUser.deletedAt) {
      return NextResponse.json(
        { error: "Não é possível modificar um usuário removido" },
        { status: 400 }
      )
    }

    // Não permitir modificar a si mesmo
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "Você não pode modificar seu próprio perfil por esta rota" },
        { status: 400 }
      )
    }

    const updateData: any = {}

    // Atualizar role
    if (role && ["USER", "AGENT", "ADMIN"].includes(role)) {
      updateData.role = role as UserRole
    }

    // Atualizar status (ativo/inativo via soft delete)
    if (typeof active === "boolean") {
      if (active) {
        // Reativar: remover deletedAt
        updateData.deletedAt = null
      } else {
        // Desativar: definir deletedAt
        updateData.deletedAt = new Date()
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo válido para atualizar" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      user: updatedUser,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário" },
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
        { error: "Acesso negado. Apenas administradores podem remover usuários." },
        { status: 403 }
      )
    }

    const { id } = await params

    // Validar que o usuário existe
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Não permitir remover a si mesmo
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: "Você não pode remover seu próprio usuário" },
        { status: 400 }
      )
    }

    // Soft delete: definir deletedAt
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        deletedAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      user: deletedUser,
      message: "Usuário removido com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao remover usuário:", error)
    return NextResponse.json(
      { error: "Erro interno ao remover usuário" },
      { status: 500 }
    )
  }
}

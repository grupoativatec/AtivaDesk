import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { encrypt } from "@/lib/crypto/encrypt"

export async function GET(
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
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params

    const colaborador = await prisma.colaboradorExterno.findUnique({
      where: { id },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        registradoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!colaborador) {
      return NextResponse.json(
        { error: "Acesso não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      acesso: colaborador,
    })
  } catch (error: any) {
    console.error("Erro ao buscar acesso:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar acesso" },
      { status: 500 }
    )
  }
}

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
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { nome, email, senha, departamento, categoriaId, ativo } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome.trim()
    if (email !== undefined) updateData.email = email?.trim() || null
    if (senha !== undefined) updateData.senha = senha?.trim() ? encrypt(senha.trim()) : null
    if (departamento !== undefined) updateData.departamento = departamento?.trim() || null
    if (categoriaId !== undefined) updateData.categoriaId = categoriaId || null
    if (ativo !== undefined) updateData.ativo = ativo

    const colaborador = await prisma.colaboradorExterno.update({
      where: { id },
      data: updateData,
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        registradoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      acesso: colaborador,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar acesso:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar acesso" },
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
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.colaboradorExterno.delete({
      where: { id },
    })

    return NextResponse.json({
      ok: true,
      message: "Acesso externo excluído com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao excluir acesso:", error)
    return NextResponse.json(
      { error: "Erro interno ao excluir acesso" },
      { status: 500 }
    )
  }
}

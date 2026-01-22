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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { nome } = body

    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome.trim()

    const categoria = await prisma.categoriaColaborador.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ok: true,
      categoria,
    })
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno ao atualizar categoria" },
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

    // Verificar se há acessos usando esta categoria
    const acessosCount = await prisma.colaboradorExterno.count({
      where: { categoriaId: id },
    })

    if (acessosCount > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir esta categoria pois existem ${acessosCount} acesso(s) associado(s) a ela` },
        { status: 400 }
      )
    }

    await prisma.categoriaColaborador.delete({
      where: { id },
    })

    return NextResponse.json({
      ok: true,
      message: "Categoria excluída com sucesso",
    })
  } catch (error: any) {
    console.error("Erro ao excluir categoria:", error)
    return NextResponse.json(
      { error: "Erro interno ao excluir categoria" },
      { status: 500 }
    )
  }
}

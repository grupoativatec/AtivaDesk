import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * POST /api/admin/docs/[id]/favorite
 * Adiciona documento aos favoritos do usuário
 */
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

    const { id } = await params

    // Verificar se o documento existe
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já está favoritado
    const existingFavorite = await prisma.docFavorite.findUnique({
      where: {
        docId_userId: {
          docId: id,
          userId: user.id,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Documento já está nos favoritos" },
        { status: 400 }
      )
    }

    // Adicionar aos favoritos
    await prisma.docFavorite.create({
      data: {
        docId: id,
        userId: user.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error)
    return NextResponse.json(
      { error: "Erro interno ao adicionar favorito" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/docs/[id]/favorite
 * Remove documento dos favoritos do usuário
 */
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

    const { id } = await params

    // Verificar se o favorito existe
    const existingFavorite = await prisma.docFavorite.findUnique({
      where: {
        docId_userId: {
          docId: id,
          userId: user.id,
        },
      },
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { error: "Documento não está nos favoritos" },
        { status: 404 }
      )
    }

    // Remover dos favoritos
    await prisma.docFavorite.delete({
      where: {
        docId_userId: {
          docId: id,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao remover favorito:", error)
    return NextResponse.json(
      { error: "Erro interno ao remover favorito" },
      { status: 500 }
    )
  }
}

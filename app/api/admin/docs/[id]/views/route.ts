import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * POST /api/admin/docs/[id]/views
 * Incrementa o contador de visualizações de um documento
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

    // Verificar se documento existe
    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    // Incrementar views
    await prisma.document.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao incrementar views:", error)
    return NextResponse.json(
      { error: "Erro interno ao incrementar views" },
      { status: 500 }
    )
  }
}

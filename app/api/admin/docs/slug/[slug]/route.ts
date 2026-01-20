import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

/**
 * Helper para mapear categoria do Prisma para o formato do frontend
 */
function mapCategoryToFrontend(category: string): "Infra" | "Sistemas" | "Processos" | "Segurança" | "Geral" {
  const categoryMap: Record<string, "Infra" | "Sistemas" | "Processos" | "Segurança" | "Geral"> = {
    INFRA: "Infra",
    SISTEMAS: "Sistemas",
    PROCESSOS: "Processos",
    SEGURANCA: "Segurança",
    GERAL: "Geral",
  }
  return categoryMap[category] || "Geral"
}

/**
 * GET /api/admin/docs/slug/[slug]
 * Busca um documento pelo slug
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { slug } = await params

    const document = await prisma.document.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    // Mapear para o formato do frontend
    const mappedDoc = {
      id: document.id,
      title: document.title,
      slug: document.slug,
      summary: document.summary,
      category: mapCategoryToFrontend(document.category as string),
      tags: document.tags,
      status: document.status.toLowerCase() as "draft" | "published",
      updatedAt: document.updatedAt.toISOString(),
      authorId: document.authorId,
      authorName: document.author.name,
      views: document.views,
      archived: document.archived ?? false,
      content: document.content,
    }

    return NextResponse.json({ doc: mappedDoc })
  } catch (error) {
    console.error("Erro ao buscar documento:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar documento" },
      { status: 500 }
    )
  }
}

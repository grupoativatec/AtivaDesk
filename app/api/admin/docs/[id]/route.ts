import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

/**
 * Schema de validação para atualizar documento
 */
const updateDocumentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").optional(),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido").optional(),
  summary: z.string().min(1, "Resumo é obrigatório").optional(),
  content: z.string().optional(),
  category: z.enum(["INFRA", "SISTEMAS", "PROCESSOS", "SEGURANCA", "GERAL"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
})

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
 * GET /api/admin/docs/[id]
 * Busca um documento pelo ID
 */
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

    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
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

/**
 * PUT /api/admin/docs/[id]
 * Atualiza um documento
 */
export async function PUT(
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
    const body = await req.json()

    // Verificar se documento existe
    const existingDoc = await prisma.document.findUnique({
      where: { id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Documento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar permissão (apenas o autor pode editar)
    if (existingDoc.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este documento" },
        { status: 403 }
      )
    }

    // Mapear dados do frontend para o formato do Prisma
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.summary !== undefined) updateData.summary = body.summary
    if (body.content !== undefined) updateData.content = body.content
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.archived !== undefined) updateData.archived = body.archived

    // Mapear categoria
    if (body.category !== undefined) {
      const categoryMap: Record<string, "INFRA" | "SISTEMAS" | "PROCESSOS" | "SEGURANCA" | "GERAL"> = {
        Infra: "INFRA",
        Sistemas: "SISTEMAS",
        Processos: "PROCESSOS",
        Segurança: "SEGURANCA",
        Geral: "GERAL",
      }
      updateData.category = categoryMap[body.category] || body.category
    }

    // Mapear status
    if (body.status !== undefined) {
      const statusMap: Record<string, "DRAFT" | "PUBLISHED"> = {
        draft: "DRAFT",
        published: "PUBLISHED",
      }
      updateData.status = statusMap[body.status] || body.status
    }

    // Validar slug se foi alterado
    if (body.slug !== undefined && body.slug !== existingDoc.slug) {
      // Validar formato
      if (!/^[a-z0-9-]+$/.test(body.slug)) {
        return NextResponse.json(
          { error: "Slug inválido" },
          { status: 400 }
        )
      }

      // Verificar se slug já existe
      const slugExists = await prisma.document.findUnique({
        where: { slug: body.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "Este slug já está em uso" },
          { status: 400 }
        )
      }

      updateData.slug = body.slug
    }

    // Validar com zod
    const parsed = updateDocumentSchema.safeParse(updateData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    // Atualizar documento
    const document = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

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
    console.error("Erro ao atualizar documento:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar documento" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/docs/[id]
 * Deleta um documento
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

    // Verificar permissão (apenas o autor ou admin pode deletar)
    if (document.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Você não tem permissão para deletar este documento" },
        { status: 403 }
      )
    }

    // Deletar documento
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar documento:", error)
    return NextResponse.json(
      { error: "Erro interno ao deletar documento" },
      { status: 500 }
    )
  }
}

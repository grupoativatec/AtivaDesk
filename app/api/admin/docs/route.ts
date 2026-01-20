import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { z } from "zod"

/**
 * Schema de validação para criar/atualizar documento
 */
const documentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  summary: z.string().min(1, "Resumo é obrigatório"),
  content: z.string().default(""),
  category: z.enum(["INFRA", "SISTEMAS", "PROCESSOS", "SEGURANCA", "GERAL"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  tags: z.array(z.string()).default([]),
})

/**
 * GET /api/admin/docs
 * Lista documentos com filtros, busca e ordenação
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    // Parâmetros de filtro
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const archived = searchParams.get("archived")
    const onlyMine = searchParams.get("onlyMine") === "true"
    const searchQuery = searchParams.get("search")?.trim() || ""
    const sortBy = searchParams.get("sortBy") || "recent"

    // Construir where clause
    const where: any = {}

    // Filtro de arquivados
    if (archived === "true") {
      where.archived = true
    } else if (archived === "false") {
      where.archived = false
    }
    // Se não especificado, mostra apenas não arquivados por padrão
    if (!archived) {
      where.archived = false
    }

    // Filtro de categoria
    if (category && category !== "all") {
      // Mapear do frontend para o enum do Prisma
      const categoryMap: Record<string, string> = {
        Infra: "INFRA",
        Sistemas: "SISTEMAS",
        Processos: "PROCESSOS",
        Segurança: "SEGURANCA",
        Geral: "GERAL",
      }
      where.category = categoryMap[category] || category
    }

    // Filtro de status
    if (status === "published") {
      where.status = "PUBLISHED"
    } else if (status === "draft") {
      where.status = "DRAFT"
    }

    // Filtro de autor (meus documentos)
    if (onlyMine) {
      where.authorId = user.id
    }

    // Busca por título ou resumo
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { summary: { contains: searchQuery, mode: "insensitive" } },
      ]
    }

    // Construir orderBy
    let orderBy: any = {}
    switch (sortBy) {
      case "recent":
        orderBy = { updatedAt: "desc" }
        break
      case "oldest":
        orderBy = { updatedAt: "asc" }
        break
      case "az":
        orderBy = { title: "asc" }
        break
      case "views":
        orderBy = { views: "desc" }
        break
      default:
        orderBy = { updatedAt: "desc" }
    }

    // Buscar documentos
    const documents = await prisma.document.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    })

    // Mapear para o formato esperado pelo frontend
    const mappedDocs = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      summary: doc.summary,
      category: mapCategoryToFrontend(doc.category as string),
      tags: doc.tags,
      status: (doc.status.toLowerCase() as "draft" | "published"),
      updatedAt: doc.updatedAt.toISOString(),
      authorId: doc.authorId,
      authorName: doc.author.name,
      views: doc.views,
      archived: doc.archived ?? false,
      content: doc.content,
    }))

    return NextResponse.json({ docs: mappedDocs })
  } catch (error) {
    console.error("Erro ao buscar documentos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar documentos" },
      { status: 500 }
    )
  }
}

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
 * POST /api/admin/docs
 * Cria um novo documento
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Mapear categoria do frontend para o enum do Prisma
    const categoryMap: Record<string, "INFRA" | "SISTEMAS" | "PROCESSOS" | "SEGURANCA" | "GERAL"> = {
      Infra: "INFRA",
      Sistemas: "SISTEMAS",
      Processos: "PROCESSOS",
      Segurança: "SEGURANCA",
      Geral: "GERAL",
    }

    const statusMap: Record<string, "DRAFT" | "PUBLISHED"> = {
      draft: "DRAFT",
      published: "PUBLISHED",
    }

    const validatedData = {
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      content: body.content || "",
      category: categoryMap[body.category] || "GERAL",
      status: statusMap[body.status] || "DRAFT",
      tags: body.tags || [],
    }

    // Validar com zod
    const parsed = documentSchema.safeParse(validatedData)
    if (!parsed.success) {
      console.error("Erro de validação Zod:", JSON.stringify(parsed.error, null, 2))
      const errorMessage = parsed.error?.errors && parsed.error.errors.length > 0
        ? parsed.error.errors[0].message
        : parsed.error?.message || "Dados inválidos"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Verificar se slug já existe
    const existingDoc = await prisma.document.findUnique({
      where: { slug: parsed.data.slug },
    })

    if (existingDoc) {
      return NextResponse.json(
        { error: "Este slug já está em uso" },
        { status: 400 }
      )
    }

    // Criar documento
    const document = await prisma.document.create({
      data: {
        ...parsed.data,
        authorId: user.id,
      },
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

    return NextResponse.json({ doc: mappedDoc }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar documento:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar documento" },
      { status: 500 }
    )
  }
}

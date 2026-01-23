import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { ProjectStatus, TaskUnit } from "@/lib/generated/prisma/enums"
import { z } from "zod"

/**
 * Schema de validação para criação de projeto
 */
const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z
    .string()
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(20, "Código deve ter no máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  unit: z.enum(["ITJ", "SFS", "FOZ", "DIO", "AOL"]).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
})

/**
 * GET /api/admin/projects
 * Lista projetos com filtros e paginação
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

    // Apenas admins podem acessar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem ver projetos." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")
    const status = searchParams.get("status")
    const unit = searchParams.get("unit")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // Construir filtros
    const where: any = {}

    if (status && status !== "all") {
      where.status = status as ProjectStatus
    }

    if (unit && unit !== "all") {
      where.unit = unit as TaskUnit
    }

    // Busca por texto (nome ou código)
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ]
    }

    // Calcular offset
    const skip = (page - 1) * pageSize

    // Buscar projetos com contagem de tarefas
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ])

    // Transformar para formato ProjectListItem
    const projectsList = projects.map((project) => ({
      id: project.id,
      name: project.name,
      code: project.code,
      status: project.status,
      unit: project.unit,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      _count: {
        tasks: project._count.tasks,
      },
    }))

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      projects: projectsList,
      total,
      page,
      pageSize,
      totalPages,
    })
  } catch (error: any) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar projetos" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/projects
 * Cria um novo projeto
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Apenas admins podem criar projetos
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar projetos." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createProjectSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]
      const errorMessage = firstError?.message || "Dados inválidos"
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { name, code, unit, status } = parsed.data

    // Verificar se código já existe (se fornecido)
    if (code && code.trim()) {
      const existingProject = await prisma.project.findUnique({
        where: { code: code.trim() },
      })

      if (existingProject) {
        return NextResponse.json(
          { error: "Já existe um projeto com este código" },
          { status: 400 }
        )
      }
    }

    // Criar projeto
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        code: code && code.trim() ? code.trim() : null,
        unit: unit || null,
        status: status || "ACTIVE",
        createdById: user.id,
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    })

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        unit: project.unit,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        _count: {
          tasks: project._count.tasks,
        },
      },
    })
  } catch (error: any) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno ao criar projeto" },
      { status: 500 }
    )
  }
}

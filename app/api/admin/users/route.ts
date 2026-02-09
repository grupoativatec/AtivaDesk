import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { UserRole } from "@/lib/generated/prisma/enums"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["USER", "AGENT", "ADMIN"]).default("USER"),
})

/**
 * POST /api/admin/users
 * Cria um novo usuário (apenas ADMIN)
 */
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar usuários." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const result = createUserSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = result.data

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      ok: true,
      user: newUser,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar usuário" },
      { status: 500 }
    )
  }
}

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
        { error: "Acesso negado. Apenas administradores podem ver usuários." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const status = searchParams.get("status") || "active" // active | inactive | all
    const all = searchParams.get("all") === "true" // Retornar todos sem paginação
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)

    // Construir filtros
    const where: any = {}

    // Filtro por role
    if (role && ["USER", "AGENT", "ADMIN"].includes(role)) {
      where.role = role as UserRole
    }

    // Filtro por status (ativo/inativo baseado em deletedAt)
    if (status === "inactive") {
      // Usuários deletados (soft delete)
      where.deletedAt = { not: null }
    } else if (status === "active") {
      // Usuários ativos (não deletados)
      where.deletedAt = null
    }
    // Se status === "all", não filtra por deletedAt (mostra todos)

    // Busca por nome ou email
    if (search.trim()) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Contar total (com filtros)
    const total = await prisma.user.count({ where })

    // Buscar usuários (com ou sem paginação)
    let users
    if (all) {
      // Retornar todos sem paginação
      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true,
          teamMemberships: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    } else {
      // Buscar com paginação
      const skip = (page - 1) * pageSize
      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true,
          teamMemberships: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      })
    }

    return NextResponse.json({
      ok: true,
      users,
      ...(all
        ? {}
        : {
            pagination: {
              page,
              pageSize,
              total,
              totalPages: Math.ceil(total / pageSize),
            },
          }),
    })
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar usuários" },
      { status: 500 }
    )
  }
}

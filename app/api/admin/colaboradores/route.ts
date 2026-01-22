import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"

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
        { error: "Acesso negado. Apenas administradores podem ver colaboradores externos." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "active" // active | inactive | all
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10)

    // Construir filtros
    const where: any = {}

    // Filtro por status (ativo/inativo)
    if (status === "inactive") {
      where.ativo = false
    } else if (status === "active") {
      where.ativo = true
    }
    // Se status === "all", não filtra por ativo (mostra todos)

    // Busca por nome, email ou departamento
    if (search.trim()) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { departamento: { contains: search, mode: "insensitive" } },
      ]
    }

    // Contar total (com filtros)
    const total = await prisma.colaboradorExterno.count({ where })

    // Buscar colaboradores (com paginação)
    const skip = (page - 1) * pageSize
    const colaboradores = await prisma.colaboradorExterno.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    })

    return NextResponse.json({
      ok: true,
      colaboradores,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar colaboradores externos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar colaboradores externos" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Apenas admins podem criar
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem criar colaboradores externos." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { nome, email, senha, departamento, categoriaId } = body

    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const colaborador = await prisma.colaboradorExterno.create({
      data: {
        nome: nome.trim(),
        email: email?.trim() || null,
        senha: senha?.trim() ? encrypt(senha.trim()) : null,
        departamento: departamento?.trim() || null,
        categoriaId: categoriaId || null,
        registradoPorId: user.id,
        ativo: true,
      },
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
      colaborador,
    })
  } catch (error: any) {
    console.error("Erro ao criar colaborador externo:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar colaborador externo" },
      { status: 500 }
    )
  }
}

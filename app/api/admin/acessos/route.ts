import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { encrypt } from "@/lib/crypto/encrypt"
import { generateUniquePassword } from "@/lib/utils/generate-password"

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
        { error: "Acesso negado. Apenas administradores podem ver acessos externos." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all" // active | inactive | all
    const departamento = searchParams.get("departamento") || ""
    const categoriaId = searchParams.get("categoriaId") || ""
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

    // Filtro por departamento
    if (departamento && departamento !== "all") {
      where.departamento = { equals: departamento, mode: "insensitive" }
    }

    // Filtro por categoria
    if (categoriaId && categoriaId !== "all") {
      where.categoriaId = categoriaId
    }

    // Busca por nome, usuario, email ou departamento
    if (search.trim()) {
      const searchConditions = [
        { nome: { contains: search, mode: "insensitive" } },
        { usuario: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { departamento: { contains: search, mode: "insensitive" } },
      ]

      // Se já tem outros filtros, usar AND com OR
      if (Object.keys(where).length > 0) {
        where.AND = [
          ...(where.AND || []),
          { OR: searchConditions }
        ]
        delete where.OR
      } else {
        where.OR = searchConditions
      }
    }

    // Contar total (com filtros)
    const total = await prisma.colaboradorExterno.count({ where })

    // Buscar TODOS os acessos que correspondem aos filtros (sem paginação ainda)
    const todosColaboradores = await prisma.colaboradorExterno.findMany({
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
    })

    // Ordenar alfabeticamente por nome (case-insensitive)
    const colaboradoresOrdenados = todosColaboradores.sort((a, b) => {
      const nomeA = String(a.nome || "").trim().toLowerCase()
      const nomeB = String(b.nome || "").trim().toLowerCase()
      return nomeA.localeCompare(nomeB, "pt-BR", { 
        sensitivity: "base",
        numeric: true,
        ignorePunctuation: true
      })
    })

    // Aplicar paginação manualmente após ordenação
    const skip = (page - 1) * pageSize
    const colaboradores = colaboradoresOrdenados.slice(skip, skip + pageSize)

    return NextResponse.json({
      ok: true,
      acessos: colaboradores,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error("Erro ao buscar acessos externos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar acessos externos" },
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
        { error: "Acesso negado. Apenas administradores podem criar acessos externos." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { nome, usuario, email, senha, departamento, categoriaId } = body

    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    // Gerar senha automaticamente se não fornecida
    let senhaFinal = senha?.trim() || null
    if (!senhaFinal) {
      senhaFinal = await generateUniquePassword()
    }

    const acesso = await prisma.colaboradorExterno.create({
      data: {
        nome: nome.trim(),
        usuario: usuario?.trim() || null,
        email: email?.trim() || null,
        senha: senhaFinal ? encrypt(senhaFinal) : null,
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
      acesso: acesso,
    })
  } catch (error: any) {
    console.error("Erro ao criar acesso externo:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar acesso externo" },
      { status: 500 }
    )
  }
}

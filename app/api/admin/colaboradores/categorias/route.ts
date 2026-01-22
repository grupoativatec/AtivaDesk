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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const categorias = await prisma.categoriaColaborador.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json({
      ok: true,
      categorias,
    })
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar categorias" },
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { nome } = body

    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoriaColaborador.create({
      data: {
        nome: nome.trim(),
      },
    })

    return NextResponse.json({
      ok: true,
      categoria,
    })
  } catch (error: any) {
    console.error("Erro ao criar categoria:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Erro interno ao criar categoria" },
      { status: 500 }
    )
  }
}

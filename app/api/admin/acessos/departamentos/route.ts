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

    // Buscar todos os departamentos únicos
    const acessos = await prisma.colaboradorExterno.findMany({
      select: {
        departamento: true,
      },
      where: {
        departamento: {
          not: null,
        },
      },
    })

    // Extrair departamentos únicos e ordenar
    const departamentos = Array.from(
      new Set(
        acessos
          .map((a) => a.departamento)
          .filter((d): d is string => d !== null)
      )
    ).sort()

    return NextResponse.json({
      ok: true,
      departamentos,
    })
  } catch (error: any) {
    console.error("Erro ao buscar departamentos:", error)
    return NextResponse.json(
      { error: "Erro interno ao buscar departamentos" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { decrypt } from "@/lib/crypto/encrypt"

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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const { id } = await params

    const colaborador = await prisma.colaboradorExterno.findUnique({
      where: { id },
      select: {
        id: true,
        senha: true,
      },
    })

    if (!colaborador) {
      return NextResponse.json(
        { error: "Colaborador não encontrado" },
        { status: 404 }
      )
    }

    if (!colaborador.senha) {
      return NextResponse.json({
        ok: true,
        senha: null,
      })
    }

    const senhaDescriptografada = decrypt(colaborador.senha)

    return NextResponse.json({
      ok: true,
      senha: senhaDescriptografada,
    })
  } catch (error: any) {
    console.error("Erro ao descriptografar senha:", error)
    return NextResponse.json(
      { error: "Erro interno ao descriptografar senha" },
      { status: 500 }
    )
  }
}

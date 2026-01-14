import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}

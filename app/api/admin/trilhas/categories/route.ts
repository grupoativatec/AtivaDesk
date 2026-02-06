
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TrilhasService } from "@/lib/trilhas/services"

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const categories = await TrilhasService.listCategories()
        return NextResponse.json({ categories })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || "Error fetching categories" }, { status: 500 })
    }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const name = (body?.name ?? "").toString().trim()

    if (!name) {
      return NextResponse.json(
        { error: "Informe o nome da categoria" },
        { status: 400 }
      )
    }

    const category = await TrilhasService.createCategory({
      name,
      // opcionais, caso você queira mandar depois do client
      slug: body?.slug,
      color: body?.color,
      order: body?.order,
      isActive: body?.isActive,
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (e: any) {
    console.error(e)

    const msg = e?.message || "Error creating category"
    // slug duplicado -> 409
    const status =
      typeof msg === "string" && msg.toLowerCase().includes("slug")
        ? 409
        : 500

    return NextResponse.json({ error: msg }, { status })
  }
}
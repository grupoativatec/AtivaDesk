
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

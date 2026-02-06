
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TrilhasService } from "@/lib/trilhas/services"

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { slug } = params

        const post = await TrilhasService.getPostBySlug(decodeURIComponent(slug))

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        return NextResponse.json({ post })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || "Error fetching post" }, { status: 500 })
    }
}

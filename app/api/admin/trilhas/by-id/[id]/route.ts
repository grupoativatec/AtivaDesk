
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TrilhasService, UpdatePostData } from "@/lib/trilhas/services"

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        const body = await req.json()
        
        // Basic validation
        if (!body.title || !body.slug || !body.categorySlug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

         const data: UpdatePostData = {
            title: body.title,
            excerpt: body.excerpt,
            content: body.content,
            slug: body.slug,
            categorySlug: body.categorySlug,
            status: body.status || "PUBLISHED",
            pinned: !!body.pinned
        }

        try {
            const post = await TrilhasService.updatePost(id, data)
            return NextResponse.json({ post })
        } catch (error: any) {
             if (error.message === "Category not found") {
                return NextResponse.json({ error: "Category not found" }, { status: 400 })
            }
            if (error.message === "Slug already in use") {
                return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
            }
            throw error
        }

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || "Error updating post" }, { status: 500 })
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        await TrilhasService.deletePost(id)

        return NextResponse.json({ ok: true })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || "Error deleting post" }, { status: 500 })
    }
}


import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/get-current-user"
import { TrilhasService, ListPostsFilters, CreatePostData } from "@/lib/trilhas/services"
import { UpdatePostStatus } from "@/lib/generated/prisma/enums"


// GET /api/admin/trilhas
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const filters: ListPostsFilters = {
            q: searchParams.get("q") ?? undefined,
            cat: searchParams.get("cat") ?? undefined,
            status: (searchParams.get("status") as UpdatePostStatus | "all") ?? undefined,
            pinned: searchParams.get("pinned") === "true"
        }

        const posts = await TrilhasService.listPosts(filters)

        return NextResponse.json({ posts })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || "Error fetching posts" }, { status: 500 })
    }
}

// POST /api/admin/trilhas (Create)
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        
        // Basic validation
        if (!body.title || !body.slug || !body.categorySlug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const data: CreatePostData = {
            title: body.title,
            excerpt: body.excerpt,
            content: body.content,
            slug: body.slug,
            categorySlug: body.categorySlug,
            status: body.status || "PUBLISHED",
            pinned: !!body.pinned
        }

        try {
            const post = await TrilhasService.createPost(data)
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
        return NextResponse.json({ error: e.message || "Error creating post" }, { status: 500 })
    }
}

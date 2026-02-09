import { NextResponse } from "next/server"
import { TrilhasService } from "@/lib/trilhas/services"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const postId = searchParams.get("postId") || undefined
        const feedbacks = await TrilhasService.listFeedbacks(postId)
        return NextResponse.json({ feedbacks })
    } catch (error) {
        console.error("[TRILHAS_FEEDBACKS_GET]", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

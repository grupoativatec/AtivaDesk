import { NextResponse } from "next/server"
import { TrilhasService } from "@/lib/trilhas/services"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const feedbacks = await TrilhasService.listFeedbacks()
        return NextResponse.json({ feedbacks })
    } catch (error) {
        console.error("[TRILHAS_FEEDBACKS_GET]", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

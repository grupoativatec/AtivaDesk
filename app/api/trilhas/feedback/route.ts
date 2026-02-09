import { NextResponse } from "next/server"
import { TrilhasService } from "@/lib/trilhas/services"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { postId, rating, comment } = body

        if (!postId || !rating) {
            return NextResponse.json(
                { error: "Post ID and rating are required" },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            )
        }

        const feedback = await TrilhasService.createFeedback({
            postId,
            rating,
            comment,
        })

        return NextResponse.json(feedback, { status: 201 })
    } catch (error) {
        console.error("[TRILHAS_FEEDBACK_POST]", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

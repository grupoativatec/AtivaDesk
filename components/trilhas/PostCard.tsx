import { TrilhasPostListItem } from "@/lib/trilhas/type"
import Link from "next/link"

function relativeDays(date: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return "hoje"
    if (diff === 1) return "há 1 dia"
    return `há ${diff} dias`
}

export default function PostCard({ post }: { post: TrilhasPostListItem }) {
    return (
        <article className="rounded-2xl bg-white px-8 py-7 shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    {post.category.name}
                </span>

                <span className="text-xs text-slate-400">{relativeDays(post.updatedAt)}</span>
            </div>

            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-sky-600">
                <Link href={`/trilhas/${post.slug}`} className="hover:underline">
                    {post.title}
                </Link>
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-slate-700">{post.excerpt}</p>

            <div className="mt-6 flex justify-center">
                <Link href={`/trilhas/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline">
                    MAIS <span aria-hidden>↓</span>
                </Link>
            </div>
        </article>
    )
}

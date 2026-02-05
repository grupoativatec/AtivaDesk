import CategorySidebar from "@/components/trilhas/CategorySidebar"
import { notFound } from "next/navigation"
import TrilhasTopNav from "@/components/trilhas/TrilhasTopNav"
import { getTrilhasCategories, getTrilhasPostBySlug } from "@/lib/trilhas/queries"

function relativeDays(date: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return "hoje"
    if (diff === 1) return "há 1 dia"
    return `há ${diff} dias`
}

export default async function PostPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ cat?: string; q?: string }>
}) {
    const { slug } = await params
    const sp = await searchParams
    const activeCategory = (sp.cat ?? "").trim()

    const [post, categories] = await Promise.all([
        getTrilhasPostBySlug(slug),
        getTrilhasCategories(),
    ])

    if (!post) return notFound()

    return (
        <div className="min-h-screen bg-slate-50">
            <TrilhasTopNav />

            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
                    <article className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                {post.category.name}
                            </span>

                            <span className="text-xs text-slate-400">
                                {relativeDays(post.updatedAt)}
                            </span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-sky-600">
                            {post.title}
                        </h1>

                        {/* ✅ render HTML do TipTap */}
                        <div
                            className="prose prose-slate mt-6 max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </article>

                    <div className="md:pt-1">
                        <div className="sticky top-6">
                            <CategorySidebar categories={categories} activeCategory={activeCategory} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

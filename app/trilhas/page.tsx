import CategorySidebar from "@/components/trilhas/CategorySidebar"
import Hero from "@/components/trilhas/Hero"
import PostsList from "@/components/trilhas/PostsList"
import { getTrilhasCategories, getTrilhasPosts } from "@/lib/trilhas/queries"
import { FadeIn } from "@/components/trilhas/FadeIn"

type SearchParams = { q?: string; cat?: string }

export default async function TrilhasPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const sp = await searchParams
    const q = (sp.q ?? "").trim()
    const cat = (sp.cat ?? "").trim()

    const [posts, categories] = await Promise.all([
        getTrilhasPosts({ q, cat }),
        getTrilhasCategories(),
    ])

    return (
        <div className="min-h-screen overflow-hidden bg-slate-50">
            <Hero />

            <div className="mx-auto w-full max-w-7xl px-4">
                <div className="pt-14">
                    <div className="mt-8 grid grid-cols-1 gap-6 pb-12 md:grid-cols-[1fr_260px]">
                        <FadeIn delay={0.4}>
                            <PostsList posts={posts} />
                        </FadeIn>
                        <FadeIn delay={0.5}>
                            <CategorySidebar categories={categories} activeCategory={cat} />
                        </FadeIn>
                    </div>
                </div>
            </div>
        </div>
    )
}

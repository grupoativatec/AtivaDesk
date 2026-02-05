"use client"

import { TrilhasCategory } from "@/lib/trilhas/type"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CategorySidebar({
    categories,
    activeCategory,
}: {
    categories: TrilhasCategory[]
    activeCategory: string
}) {
    const sp = useSearchParams()
    const q = sp.get("q") ?? ""

    function buildHref(catSlug?: string) {
        const params = new URLSearchParams()
        if (q) params.set("q", q)
        if (catSlug) params.set("cat", catSlug)
        const qs = params.toString()
        return qs ? `/trilhas?${qs}` : "/trilhas"
    }

    return (
        <aside className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <ul className="space-y-2 text-sm">
                <li>
                    <Link
                        href={buildHref(undefined)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 ${!activeCategory ? "font-semibold" : ""
                            }`}
                    >
                        <span className="h-2 w-2 rounded-full bg-black" />
                        Todas as categorias
                    </Link>
                </li>

                {categories.map((cat) => {
                    const active = activeCategory === cat.slug
                    return (
                        <li key={cat.id}>
                            <Link
                                href={buildHref(cat.slug)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 ${active ? "font-semibold" : ""
                                    }`}
                            >
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: cat.color ?? "#cbd5e1" }}
                                />
                                {cat.name}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </aside>
    )
}

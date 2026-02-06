"use client"

import { TrilhasCategory } from "@/lib/trilhas/type"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
        <aside className="space-y-4">
            {/* Lista */}
            <div className="relative overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
                {/* textura MUITO sutil no card */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.10]"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
                        backgroundSize: "90px 90px",
                    }}
                />

                <nav className="relative flex flex-col">
                    <Link
                        href={buildHref(undefined)}
                        className={cn(
                            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            !activeCategory
                                ? "text-red-700"
                                : "text-slate-600 hover:bg-red-50/50 hover:text-slate-900"
                        )}
                    >
                        {!activeCategory && (
                            <motion.div
                                layoutId="active-category"
                                className="absolute inset-0 rounded-lg bg-red-50/60 ring-1 ring-red-200/60"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        <span
                            className={cn(
                                "h-2 w-2 rounded-full",
                                !activeCategory ? "bg-red-600" : "bg-slate-300"
                            )}
                        />
                        Todas as categorias
                    </Link>

                    {categories.map((cat) => {
                        const active = activeCategory === cat.slug
                        return (
                            <Link
                                key={cat.id}
                                href={buildHref(cat.slug)}
                                className={cn(
                                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    active
                                        ? "text-red-700"
                                        : "text-slate-600 hover:bg-red-50/50 hover:text-slate-900"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-category"
                                        className="absolute inset-0 rounded-lg bg-red-50/60 ring-1 ring-red-200/60"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}

                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: active
                                            ? (cat.color ?? "#dc2626") // red-600 fallback
                                            : "#cbd5e1", // slate-300
                                    }}
                                />
                                {cat.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

        </aside>
    )
}

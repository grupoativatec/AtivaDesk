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
            <div className="rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
                <nav className="flex flex-col">
                    <Link
                        href={buildHref(undefined)}
                        className={cn(
                            "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            !activeCategory
                                ? "bg-slate-50 text-sky-600"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        {!activeCategory && (
                            <motion.div
                                layoutId="active-category"
                                className="absolute inset-0 rounded-lg bg-slate-100"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        <span className={cn("h-2 w-2 rounded-full", !activeCategory ? "bg-sky-500" : "bg-slate-300")} />
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
                                        ? "text-sky-600"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="active-category"
                                        className="absolute inset-0 rounded-lg bg-slate-100"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: active ? (cat.color ?? "#0ea5e9") : (cat.color ?? "#cbd5e1") }}
                                />
                                {cat.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Banner promocional ou dica extra (opcional) */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-md">
                <p className="font-semibold">Tem uma sugestão?</p>
                <p className="mt-2 text-xs text-indigo-100">
                    Envie suas ideias de conteúdo para nós!
                </p>
            </div>
        </aside>
    )
}


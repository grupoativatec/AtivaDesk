"use client"

import { TrilhasPostListItem } from "@/lib/trilhas/type"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight } from "lucide-react"

function relativeDays(date: Date) {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return "hoje"
    if (diff === 1) return "há 1 dia"
    return `há ${diff} dias`
}

export default function PostCard({ post }: { post: TrilhasPostListItem }) {
    return (
        <motion.article
            whileHover={{ y: -4 }}
            className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-shadow hover:shadow-lg sm:p-8"
        >
            <div>
                <div className="flex items-center gap-x-4 text-xs capitalize">
                    <time dateTime={new Date(post.updatedAt).toISOString()} className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {relativeDays(post.updatedAt)}
                    </time>
                    <span
                        className="relative z-10 rounded-full bg-sky-50 px-3 py-1.5 font-medium text-sky-600 hover:bg-sky-100 transition-colors"
                        style={{ backgroundColor: post.category.color ? `${post.category.color}20` : undefined, color: post.category.color ?? undefined }}
                    >
                        {post.category.name}
                    </span>
                </div>
                <div className="group relative max-w-xl">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-sky-600 transition-colors">
                        <Link href={`/trilhas/${post.slug}`}>
                            <span className="absolute inset-0" />
                            {post.title}
                        </Link>
                    </h3>
                    <p className="mt-5 text-sm leading-6 text-gray-600 line-clamp-3">
                        {post.excerpt}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-600 opacity-0 transition-opacity group-hover:opacity-100">
                Ler mais <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </motion.article>
    )
}


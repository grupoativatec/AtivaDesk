import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Pin, Calendar, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type TrilhasPostCardItem = {
    id: string
    slug: string
    title: string
    excerpt: string
    updatedAt: string | Date
    pinned?: boolean
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    category?: { name: string; slug: string; color: string | null }
    stats?: {
        avgRating: number
        feedbackCount: number
    }
}

export function TrilhasPostCard({ post }: { post: TrilhasPostCardItem }) {
    const statusConfig = {
        PUBLISHED: { label: "Publicado", variant: "default" as const, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
        DRAFT: { label: "Rascunho", variant: "secondary" as const, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
        ARCHIVED: { label: "Arquivado", variant: "destructive" as const, color: "bg-slate-500/10 text-slate-600 border-slate-200" },
    }

    const currentStatus = post.status ? statusConfig[post.status] : null

    return (
        <Card className="group relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="p-4 flex flex-col h-full">
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            {post.category?.name && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                                    {post.category.name}
                                </span>
                            )}
                            {post.pinned && (
                                <Pin className="size-3 text-orange-500 fill-orange-500" />
                            )}
                        </div>
                        <Link href={`/admin/trilhas/${post.slug}`} className="block group/title">
                            <h3 className="text-sm font-bold text-slate-900 leading-tight transition-colors group-hover/title:text-primary line-clamp-1">
                                {post.title}
                            </h3>
                        </Link>
                    </div>

                    {currentStatus && (
                        <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 h-5 font-semibold border", currentStatus.color)}
                        >
                            {currentStatus.label}
                        </Badge>
                    )}
                </div>

                {/* Descrição Curta */}
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                    {post.excerpt}
                </p>

                {/* Rodapé com Stats e Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                            <Star className={cn(
                                "size-3",
                                post.stats?.avgRating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"
                            )} />
                            <span className="text-[11px] font-bold text-slate-700">
                                {post.stats?.avgRating ? post.stats.avgRating.toFixed(1) : "0.0"}
                            </span>
                        </div>

                        {/* Feedback Count */}
                        <div className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="size-3" />
                            <span className="text-[11px] font-medium">
                                {post.stats?.feedbackCount || 0}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="size-3" />
                        <span className="text-[10px] font-medium">
                            {new Date(post.updatedAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

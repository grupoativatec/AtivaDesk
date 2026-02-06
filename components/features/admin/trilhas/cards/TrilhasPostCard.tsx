import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TrilhasPostCardItem = {
    id: string
    slug: string
    title: string
    excerpt: string
    updatedAt: string | Date
    pinned?: boolean
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    category?: { name: string; slug: string; color: string | null }
}

export function TrilhasPostCard({ post }: { post: TrilhasPostCardItem }) {
    return (
        <Card className="h-full">
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link href={`/admin/trilhas/${post.slug}`} className="block">
                            <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                                {post.title}
                            </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.excerpt}
                        </p>
                    </div>

                    {post.pinned ? <Badge variant="secondary">Fixado</Badge> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    {post.category?.name ? <Badge variant="outline">{post.category.name}</Badge> : null}
                    {post.status && post.status === "PUBLISHED" ? <Badge variant="default">Publicado</Badge> : null}
                    {post.status && post.status === "DRAFT" ? <Badge variant="secondary">Rascunho</Badge> : null}
                    {post.status && post.status === "ARCHIVED" ? <Badge variant="destructive">Arquivado</Badge> : null}
                </div>

                <p className="text-xs text-muted-foreground pt-3 border-t border-border/50">
                    Atualizado em{" "}
                    {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                </p>
            </CardContent>
        </Card>
    )
}

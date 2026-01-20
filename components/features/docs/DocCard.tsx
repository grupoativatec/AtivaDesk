"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useDocsStore } from "@/lib/stores/docs-store"
import { cn } from "@/lib/utils"

export type DocStatus = "draft" | "published"

export interface Doc {
  id: string
  title: string
  slug: string
  summary: string
  category: "Infra" | "Sistemas" | "Processos" | "Segurança" | "Geral"
  tags: string[]
  status: DocStatus
  updatedAt: string // ISO date
  authorId: string
  authorName: string
  views: number
  archived?: boolean
  content?: string
}

function formatUpdatedAt(updatedAt: string): string {
  const updated = new Date(updatedAt)
  const now = new Date()
  const diffMs = now.getTime() - updated.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return "Atualizado hoje"
  if (diffDays === 1) return "Atualizado há 1 dia"
  return `Atualizado há ${diffDays} dias`
}

interface DocCardProps {
  doc: Doc
}

export function DocCard({ doc }: DocCardProps) {
  const favoriteDocIds = useDocsStore((state) => state.favoriteDocIds)
  const toggleFavorite = useDocsStore((state) => state.toggleFavorite)
  const isFavorite = favoriteDocIds.includes(doc.id)

  const statusLabel = doc.status === "published" ? "Publicado" : "Rascunho"

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(doc.id)
  }

  return (
    <Card className="h-full flex flex-col border border-border/60 hover:border-primary/60 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base md:text-lg font-semibold leading-snug flex-1">
            <Link
              href={`/admin/docs/${doc.slug}`}
              className="hover:text-primary transition-colors line-clamp-2 block min-h-[2.5rem]"
            >
              {doc.title}
            </Link>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation",
              isFavorite && "opacity-100"
            )}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star
              className={cn(
                "size-4 transition-colors",
                isFavorite
                  ? "fill-amber-500 text-amber-500"
                  : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
        <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1.5">
          {doc.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-3 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[11px]">
            {doc.category}
          </Badge>

          <Badge
            variant={doc.status === "published" ? "default" : "outline"}
            className="text-[11px]"
          >
            {statusLabel}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-start gap-1.5 border-t border-border/60 pt-3">
        <p className="text-[11px] text-muted-foreground">
          {formatUpdatedAt(doc.updatedAt)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Autor: <span className="font-medium text-foreground">{doc.authorName}</span>
        </p>
      </CardFooter>
    </Card>
  )
}


"use client"

import { useMemo } from "react"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { DocCard } from "@/components/features/docs/DocCard"
import { useDocsStore } from "@/lib/stores/docs-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Star } from "lucide-react"
import Link from "next/link"

export default function FavoritesPage() {
  const getFavoriteDocs = useDocsStore((state) => state.getFavoriteDocs)
  const favoriteDocs = useMemo(() => getFavoriteDocs(), [getFavoriteDocs])

  return (
    <DocsShell pageTitle="Favoritos">
      {favoriteDocs.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Star className="size-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum documento favoritado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Você ainda não favoritou nenhum documento. Clique no ícone de estrela
                em qualquer documento para adicioná-lo aos favoritos.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/admin/docs">
                <FileText className="size-4 mr-2" />
                Explorar documentos
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {favoriteDocs.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </DocsShell>
  )
}

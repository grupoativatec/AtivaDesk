"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { DocCard, type Doc } from "@/components/features/docs/DocCard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Star } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function FavoritesPage() {
  const [favoriteDocs, setFavoriteDocs] = useState<Doc[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFavoriteDocs = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/admin/docs?favorites=true")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erro ao buscar favoritos")
        }

        setFavoriteDocs(data.docs || [])
      } catch (error: any) {
        console.error("Erro ao buscar favoritos:", error)
        toast.error(error.message || "Erro ao carregar favoritos")
        setFavoriteDocs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavoriteDocs()
  }, [])

  return (
    <DocsShell pageTitle="Favoritos">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favoriteDocs.length === 0 ? (
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
      </motion.div>
    </DocsShell>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { MarkdownRenderer, type Heading } from "@/components/features/docs/MarkdownRenderer"
import { DocTOC } from "@/components/features/docs/DocTOC"
import { DocCard, type Doc } from "@/components/features/docs/DocCard"
type DocWithContent = Doc & { content: string }
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    toast.success("Link copiado para a área de transferência")
  } else {
    toast.error("Não foi possível copiar o link")
  }
}

async function getRelatedDocs(currentDoc: Doc, limit: number = 5): Promise<Doc[]> {
  try {
    const res = await fetch(`/api/admin/docs?category=${currentDoc.category}&archived=false&limit=${limit + 1}`)
    const data = await res.json()
    
    if (!res.ok) return []
    
    // Filtrar o documento atual e limitar
    return (data.docs || [])
      .filter((doc: Doc) => doc.id !== currentDoc.id)
      .slice(0, limit)
  } catch {
    return []
  }
}

export default function DocReadPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [doc, setDoc] = useState<DocWithContent | null>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [relatedDocs, setRelatedDocs] = useState<Doc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Carregar documento
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/admin/docs/slug/${slug}`)
        const data = await res.json()

        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Documento não encontrado")
            router.push("/admin/docs")
            return
          }
          throw new Error(data.error || "Erro ao buscar documento")
        }

        const foundDoc = data.doc as DocWithContent
        setDoc(foundDoc)

        // Buscar documentos relacionados
        const related = await getRelatedDocs(foundDoc, 5)
        setRelatedDocs(related)

        // Incrementar views (uma vez por sessão)
        if (typeof window !== "undefined") {
          const key = `doc_viewed_${foundDoc.id}`
          if (!sessionStorage.getItem(key)) {
            // Incrementar views via API
            await fetch(`/api/admin/docs/${foundDoc.id}/views`, {
              method: "POST",
            }).catch(() => {}) // Ignorar erros
            sessionStorage.setItem(key, "1")
          }
        }
      } catch (error: any) {
        console.error("Erro ao carregar documento:", error)
        toast.error(error.message || "Erro ao carregar documento")
        router.push("/admin/docs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoc()
  }, [slug, router])

  // Carregar usuário atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (res.ok && data.user) {
          setCurrentUserId(data.user.id)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário atual:", error)
      }
    }
    fetchCurrentUser()
  }, [])

  if (isLoading) {
    return (
      <DocsShell pageTitle="Carregando...">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">Carregando documento...</p>
            </div>
          </CardContent>
        </Card>
      </DocsShell>
    )
  }

  if (!doc) {
    return (
      <DocsShell pageTitle="Documento não encontrado">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground text-sm">
                Documento não encontrado
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/docs">Voltar para documentação</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DocsShell>
    )
  }

  // Verificar permissão para drafts
  const canViewDraft = doc ? (doc.status === "published" || doc.authorId === currentUserId) : false

  if (!canViewDraft) {
    return (
      <DocsShell pageTitle="Sem permissão">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground text-sm">
                Você não tem permissão para visualizar este documento
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/docs">Voltar para documentação</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </DocsShell>
    )
  }

  const docUrl = typeof window !== "undefined"
    ? `${window.location.origin}/admin/docs/${doc.slug}`
    : ""

  const breadcrumbItems = [
    { label: "Home", href: "/admin/dashboard" },
    { label: "Documentação", href: "/admin/docs" },
    { label: doc.category },
    { label: doc.title },
  ]

  // Metadados para o header
  const docMetadata = {
    status: doc.status,
    category: doc.category,
    updatedAt: doc.updatedAt,
    authorName: doc.authorName,
    archived: doc.archived,
  }

  // Funções de ação
  const handleToggleFavorite = async () => {
    if (isTogglingFavorite || !doc) return

    try {
      setIsTogglingFavorite(true)
      const newFavoriteState = !isFavorite

      const method = newFavoriteState ? "POST" : "DELETE"
      const res = await fetch(`/api/admin/docs/${doc.id}/favorite`, {
        method,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao atualizar favorito")
      }

      setIsFavorite(newFavoriteState)
      toast.success(
        newFavoriteState
          ? "Adicionado aos favoritos"
          : "Removido dos favoritos"
      )
    } catch (error: any) {
      console.error("Erro ao atualizar favorito:", error)
      toast.error(error.message || "Erro ao atualizar favorito")
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleArchive = async () => {
    try {
      const res = await fetch(`/api/admin/docs/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archived: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao arquivar documento")
      }

      toast.success("Documento arquivado")
      router.push("/admin/docs")
    } catch (error: any) {
      console.error("Erro ao arquivar documento:", error)
      toast.error(error.message || "Erro ao arquivar documento")
    }
  }

  const handleUnarchive = async () => {
    try {
      const res = await fetch(`/api/admin/docs/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archived: false,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao restaurar documento")
      }

      toast.success("Documento restaurado")
      // Recarregar a página
      router.refresh()
    } catch (error: any) {
      console.error("Erro ao restaurar documento:", error)
      toast.error(error.message || "Erro ao restaurar documento")
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/docs/${doc.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao excluir documento")
      }

      toast.success("Documento excluído com sucesso")
      router.push("/admin/docs")
    } catch (error: any) {
      console.error("Erro ao excluir documento:", error)
      toast.error(error.message || "Erro ao excluir documento")
    }
  }

  // Ações para o header
  const docActions = {
    onFavorite: handleToggleFavorite,
    isFavorite: isFavorite,
    editUrl: `/admin/docs/${doc.slug}/edit`,
    onCopyLink: () => copyToClipboard(docUrl),
    onArchiveClick: !doc.archived
      ? () => setIsArchiveDialogOpen(true)
      : undefined,
    onUnarchive: doc.archived
      ? handleUnarchive
      : undefined,
    isArchived: doc.archived,
    onDelete: () => setIsDeleteDialogOpen(true),
  }

  const sidebarContent = (
    <>
      <DocTOC headings={headings} />

      {relatedDocs.length > 0 && (
        <div className="pt-6 border-t border-border/60 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Relacionados
          </p>
          <div className="space-y-2">
            {relatedDocs.map((relatedDoc) => (
              <Link
                key={relatedDoc.id}
                href={`/admin/docs/${relatedDoc.slug}`}
                className="block"
              >
                <div className="p-2 rounded-md hover:bg-accent/50 transition-colors">
                  <p className="text-xs font-medium text-foreground line-clamp-2">
                    {relatedDoc.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                    {relatedDoc.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <DocsShell
        pageTitle={doc.title}
        sidebarExtra={sidebarContent}
        breadcrumbItems={breadcrumbItems}
        docMetadata={docMetadata}
        docActions={docActions}
      >
        {/* Conteúdo Markdown */}
        <div className="max-w-3xl">
          <MarkdownRenderer
            content={doc.content || ""}
            onHeadingsChange={setHeadings}
          />
        </div>
      </DocsShell>

      {/* Dialog de arquivar (fora do DocsShell) */}
      {!doc.archived && (
        <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Arquivar documento</AlertDialogTitle>
              <AlertDialogDescription>
                Este documento será movido para a lista de arquivados e não aparecerá mais na lista principal.
                Você poderá restaurá-lo depois se precisar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>
                Arquivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog de exclusão (fora do DocsShell) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. O documento será removido
              permanentemente da documentação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

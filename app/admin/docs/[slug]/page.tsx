"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { MarkdownRenderer, type Heading } from "@/components/features/docs/MarkdownRenderer"
import { DocTOC } from "@/components/features/docs/DocTOC"
import { DocCard, type Doc } from "@/components/features/docs/DocCard"
import { useDocsStore } from "@/lib/stores/docs-store"

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

const CURRENT_USER_ID = "u-1"

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    toast.success("Link copiado para a área de transferência")
  } else {
    toast.error("Não foi possível copiar o link")
  }
}

function getRelatedDocs(currentDoc: Doc, allDocs: Doc[], limit: number = 5): Doc[] {
  const related = allDocs
    .filter(
      (doc) =>
        doc.id !== currentDoc.id &&
        !doc.archived &&
        doc.category === currentDoc.category
    )
    .slice(0, limit)

  return related
}

export default function DocReadPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const getDocBySlug = useDocsStore((state) => state.getDocBySlug)
  const docs = useDocsStore((state) => state.docs)
  const archiveDoc = useDocsStore((state) => state.archiveDoc)
  const unarchiveDoc = useDocsStore((state) => state.unarchiveDoc)
  const incrementViews = useDocsStore((state) => state.incrementViews)
  const favoriteDocIds = useDocsStore((state) => state.favoriteDocIds)
  const toggleFavorite = useDocsStore((state) => state.toggleFavorite)

  const [doc, setDoc] = useState<DocWithContent | null>(null)
  const [headings, setHeadings] = useState<Heading[]>([])
  const [relatedDocs, setRelatedDocs] = useState<Doc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const foundDoc = getDocBySlug(slug)

    if (foundDoc && foundDoc.content) {
      setDoc(foundDoc as DocWithContent)
      const related = getRelatedDocs(foundDoc, docs, 5)
      setRelatedDocs(related)
    }

    setIsLoading(false)
  }, [slug, getDocBySlug, docs])

  // Incrementa views uma vez por sessão
  useEffect(() => {
    if (!doc) return
    if (typeof window === "undefined") return

    const key = `doc_viewed_${doc.id}`
    if (sessionStorage.getItem(key)) return

    incrementViews(doc.id)
    sessionStorage.setItem(key, "1")
  }, [doc, incrementViews])

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
  const canViewDraft = doc.status === "published" || doc.authorId === CURRENT_USER_ID

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

  // Ações para o header
  const docActions = {
    onFavorite: () => toggleFavorite(doc.id),
    isFavorite: favoriteDocIds.includes(doc.id),
    editUrl: `/admin/docs/${doc.slug}/edit`,
    onCopyLink: () => copyToClipboard(docUrl),
    onArchiveClick: !doc.archived
      ? () => setIsArchiveDialogOpen(true)
      : undefined,
    onUnarchive: doc.archived
      ? () => {
        unarchiveDoc(doc.id)
        toast.success("Documento restaurado")
      }
      : undefined,
    isArchived: doc.archived,
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
              <AlertDialogAction
                onClick={() => {
                  archiveDoc(doc.id)
                  toast.success("Documento arquivado")
                  router.push("/admin/docs")
                }}
              >
                Arquivar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

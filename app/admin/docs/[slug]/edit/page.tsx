"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DocsShell } from "@/components/features/docs/DocsShell"
import { DocEditor, DocPreview } from "@/components/features/docs/DocEditor"
import { DocMetadataPanel } from "@/components/features/docs/DocMetadataPanel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { templates, getTemplate, type TemplateType } from "@/lib/docs/templates"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { DocStatus } from "@/components/features/docs/DocCard"
import { Edit, Eye, Settings } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { Doc } from "@/components/features/docs/DocCard"

type EditorTab = "edit" | "preview" | "metadata"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function DocEditPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const isMobile = useIsMobile()

  const [doc, setDoc] = useState<Doc | null>(null)

  // Verificar se slug é único via API (excluindo o documento atual)
  const checkSlugUnique = async (newSlug: string, currentDocId: string): Promise<boolean> => {
    if (newSlug === slug) return true // Mesmo slug, não precisa verificar
    try {
      const res = await fetch(`/api/admin/docs/slug/${newSlug}`)
      if (res.status === 404) return true // Slug disponível
      if (res.ok) {
        const data = await res.json()
        // Se o documento encontrado é o mesmo, está ok
        return data.doc.id === currentDocId
      }
      return false
    } catch {
      return true
    }
  }
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [content, setContent] = useState("")
  const [docSlug, setDocSlug] = useState("")
  const [category, setCategory] = useState<"Infra" | "Sistemas" | "Processos" | "Segurança" | "Geral">("Geral")
  const [status, setStatus] = useState<DocStatus>("draft")
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [slugError, setSlugError] = useState<string>("")
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<EditorTab>("edit")

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

        const foundDoc = data.doc
        setDoc(foundDoc)
        setTitle(foundDoc.title)
        setSummary(foundDoc.summary)
        setContent(foundDoc.content || "")
        setDocSlug(foundDoc.slug)
        setCategory(foundDoc.category)
        setStatus(foundDoc.status)
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

  // Validar slug único (excluindo o documento atual)
  useEffect(() => {
    if (docSlug && doc) {
      const timer = setTimeout(async () => {
        const isUnique = await checkSlugUnique(docSlug, doc.id)
        if (!isUnique) {
          setSlugError("Este slug já está em uso")
        } else {
          setSlugError("")
        }
      }, 500) // Debounce de 500ms
      return () => clearTimeout(timer)
    }
  }, [docSlug, doc, slug])

  // Detectar mudanças
  useEffect(() => {
    if (doc) {
      const hasChanges =
        title !== doc.title ||
        summary !== doc.summary ||
        content !== (doc.content || "") ||
        docSlug !== doc.slug ||
        category !== doc.category ||
        status !== doc.status

      setIsDirty(hasChanges)
    }
  }, [title, summary, content, docSlug, category, status, doc])

  // Aviso ao sair com mudanças não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplate(templateId as TemplateType)
    if (template) {
      setContent(template.content)
      setIsDirty(true)
    }
  }

  const handleSave = async (newStatus: DocStatus) => {
    if (!title.trim()) {
      toast.error("O título é obrigatório")
      return
    }

    if (!summary.trim()) {
      toast.error("O resumo é obrigatório")
      return
    }

    if (!docSlug.trim()) {
      toast.error("O slug é obrigatório")
      return
    }

    if (slugError) {
      toast.error("Corrija o erro do slug antes de salvar")
      return
    }

    if (!doc) return

    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/docs/${doc.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: docSlug.trim(),
          summary: summary.trim(),
          content: content.trim(),
          category,
          tags: [],
          status: newStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar documento")
      }

      setLastSaved(new Date())
      setIsDirty(false)
      setIsSaving(false)

      toast.success("Documento atualizado com sucesso!")

      // Se o slug mudou, redireciona para a nova URL
      if (docSlug !== slug) {
        router.push(`/admin/docs/${docSlug}`)
      }
    } catch (error: any) {
      console.error("Erro ao atualizar documento:", error)
      toast.error(error.message || "Erro ao atualizar documento")
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedDialog(true)
      setPendingNavigation(`/admin/docs/${slug}`)
    } else {
      router.push(`/admin/docs/${slug}`)
    }
  }

  const handleConfirmNavigation = () => {
    setShowUnsavedDialog(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
  }

  const breadcrumbItems = doc ? [
    { label: "Home", href: "/admin/dashboard" },
    { label: "Documentação", href: "/admin/docs" },
    { label: doc.category },
    { label: doc.title, href: `/admin/docs/${doc.slug}` },
    { label: "Editar" },
  ] : undefined

  const editorActions = {
    isDirty,
    status,
    lastSaved,
    isSaving,
    onCancel: handleCancel,
    onSaveDraft: () => handleSave("draft"),
    onPublish: () => handleSave("published"),
  }

  if (isLoading || !doc) {
    return (
      <DocsShell pageTitle="Carregando..." hideSidebar={true}>
        <Card>
          <div className="p-6 text-center">
            <p className="text-muted-foreground text-sm">Carregando documento...</p>
          </div>
        </Card>
      </DocsShell>
    )
  }

  return (
    <>
      <DocsShell
        pageTitle="Editar documento"
        breadcrumbItems={breadcrumbItems}
        editorActions={editorActions}
        hideSidebar={true}
      >
        {/* Template selector - oculto no mobile */}
        <div className="mb-6 hidden sm:block">
          <Label htmlFor="template-select" className="text-sm font-medium mb-2 block">
            Aplicar template (substitui conteúdo atual)
          </Label>
          <Select onValueChange={handleTemplateSelect}>
            <SelectTrigger id="template-select" className="w-full sm:w-64">
              <SelectValue placeholder="Selecione um template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Tabs */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Button
                variant={activeTab === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "h-9 px-3 text-sm shrink-0",
                  activeTab === "edit" && "font-semibold"
                )}
              >
                <Edit className="size-4 mr-2" />
                Editar
              </Button>
              <Button
                variant={activeTab === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "h-9 px-3 text-sm shrink-0",
                  activeTab === "preview" && "font-semibold"
                )}
              >
                <Eye className="size-4 mr-2" />
                Prévia
              </Button>
              <Button
                variant={activeTab === "metadata" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("metadata")}
                className={cn(
                  "h-9 px-3 text-sm shrink-0",
                  activeTab === "metadata" && "font-semibold"
                )}
              >
                <Settings className="size-4 mr-2" />
                Metadados
              </Button>
            </div>

            {/* Conteúdo das tabs */}
            <div className="min-h-[400px]">
              {activeTab === "edit" && (
                <Card>
                  <div className="p-4">
                    <DocEditor
                      title={title}
                      summary={summary}
                      content={content}
                      onTitleChange={setTitle}
                      onSummaryChange={setSummary}
                      onContentChange={setContent}
                    />
                  </div>
                </Card>
              )}
              {activeTab === "preview" && (
                <Card>
                  <div className="p-4">
                    <DocPreview content={content} title={title} />
                  </div>
                </Card>
              )}
              {activeTab === "metadata" && (
                <Card>
                  <div className="p-4">
                    <DocMetadataPanel
                      slug={docSlug}
                      category={category}
                      status={status}
                      onSlugChange={setDocSlug}
                      onCategoryChange={setCategory}
                      onStatusChange={setStatus}
                      slugError={slugError}
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Desktop: Layout de 2 colunas */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna 1: Editor */}
            <div className="space-y-6">
              <Card>
                <div className="p-4">
                  <DocEditor
                    title={title}
                    summary={summary}
                    content={content}
                    onTitleChange={setTitle}
                    onSummaryChange={setSummary}
                    onContentChange={setContent}
                  />
                </div>
              </Card>

              {/* Metadados em um card separado abaixo do editor */}
              <Card>
                <div className="p-4">
                  <DocMetadataPanel
                    slug={docSlug}
                    category={category}
                    status={status}
                    onSlugChange={setDocSlug}
                    onCategoryChange={setCategory}
                    onStatusChange={setStatus}
                    slugError={slugError}
                  />
                </div>
              </Card>
            </div>

            {/* Coluna 2: Preview */}
            <div>
              <Card className="sticky top-6">
                <div className="p-4">
                  <DocPreview content={content} title={title} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </DocsShell>

      {/* Dialog de confirmação ao sair */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mudanças não salvas</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem mudanças não salvas. Deseja realmente sair? Todas as alterações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNavigation}>
              Sair sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

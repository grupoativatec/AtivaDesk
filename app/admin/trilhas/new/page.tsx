"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Edit, Eye, Settings } from "lucide-react"
import { motion } from "framer-motion"
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
import { TrilhasEditor } from "@/components/features/admin/trilhas/forms/TrilhasEditor"
import { TrilhasPreview } from "@/components/features/admin/trilhas/preview/TrilhasPreview"
import { TrilhasMetadataPanel, type TrilhasStatus } from "@/components/features/admin/trilhas/forms/TrilhasMetadataPanel"
import { TrilhasAdminShell } from "@/components/features/admin/trilhas/shell/TrilhasAdminShell"
import { fetchJson } from "@/lib/http"

type Category = { id: string; name: string; slug: string; color: string | null }

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

type EditorTab = "edit" | "preview" | "metadata"

export default function NewTrilhasPostPage() {
    const router = useRouter()
    const isMobile = useIsMobile()

    const [categories, setCategories] = useState<Category[]>([])
    const [title, setTitle] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [slug, setSlug] = useState("")
    const [categorySlug, setCategorySlug] = useState("")
    const [status, setStatus] = useState<TrilhasStatus>("PUBLISHED")
    const [pinned, setPinned] = useState(false)

    const [isSaving, setIsSaving] = useState(false)
    const [slugError, setSlugError] = useState("")
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<EditorTab>("edit")

    // Validações para indicadores nas abas
    const hasEditErrors = !title.trim() || !excerpt.trim()
    const hasMetadataErrors = !slug.trim() || !categorySlug.trim() || !!slugError

    // ✅ controla se o usuário editou o slug manualmente
    const [slugTouched, setSlugTouched] = useState(false)

    // snapshots iniciais para calcular isDirty corretamente
    const initialRef = useRef({
        title: "",
        excerpt: "",
        content: "",
        slug: "",
        categorySlug: "",
        status: "DRAFT" as TrilhasStatus,
        pinned: false,
    })

    const isDirty = useMemo(() => {
        const i = initialRef.current
        return (
            title !== i.title ||
            excerpt !== i.excerpt ||
            content !== i.content ||
            slug !== i.slug ||
            categorySlug !== i.categorySlug ||
            status !== i.status ||
            pinned !== i.pinned
        )
    }, [title, excerpt, content, slug, categorySlug, status, pinned])

    // carregar categorias
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchJson<{ categories: Category[] }>("/api/admin/trilhas/categories")
                const cats = data.categories || []
                setCategories(cats)

                // set default categoria
                if (cats.length) {
                    setCategorySlug(cats[0].slug)
                    initialRef.current.categorySlug = cats[0].slug
                }
            } catch (e: any) {
                toast.error(e.message || "Erro ao carregar categorias")
            }
        }
        load()
    }, [])

    // ✅ auto slug: acompanha o título ATÉ o usuário tocar no slug manualmente
    useEffect(() => {
        if (!title.trim()) return
        if (slugTouched) return
        setSlug(generateSlug(title))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, slugTouched])

    // before unload
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

    // ✅ slug unique (GET /api/admin/trilhas/slug/[slug]) - mais robusto
    useEffect(() => {
        const s = slug.trim()
        if (!s) {
            setSlugError("")
            return
        }

        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/admin/trilhas/slug/${encodeURIComponent(s)}`, {
                    headers: { Accept: "application/json" },
                })

                // disponível
                if (res.status === 404) {
                    setSlugError("")
                    return
                }

                // se não vier JSON (ex: HTML), não bloqueia salvar
                const ct = res.headers.get("content-type") || ""
                if (!ct.includes("application/json")) {
                    setSlugError("")
                    return
                }

                // existe -> em uso
                if (res.ok) {
                    setSlugError("Este slug já está em uso")
                    return
                }

                setSlugError("")
            } catch {
                // não bloqueia salvar por falha de rede
                setSlugError("")
            }
        }, 400)

        return () => clearTimeout(t)
    }, [slug])

    const handleSave = async (newStatus: TrilhasStatus) => {
        if (!title.trim()) return toast.error("O título é obrigatório")
        if (!excerpt.trim()) return toast.error("O resumo (excerpt) é obrigatório")
        if (!slug.trim()) return toast.error("O slug é obrigatório")
        if (!categorySlug.trim()) return toast.error("A categoria é obrigatória")
        if (slugError) return toast.error("Corrija o erro do slug antes de salvar")

        setIsSaving(true)
        try {
            const data = await fetchJson<{ post: { id: string; slug: string } }>("/api/admin/trilhas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    excerpt: excerpt.trim(),
                    content: content.trim(),
                    slug: slug.trim(),
                    categorySlug,
                    status: newStatus,
                    pinned,
                }),
            })

            toast.success("Post criado com sucesso!")

            // atualiza baseline (não está mais “sujo”)
            initialRef.current = {
                title,
                excerpt,
                content,
                slug,
                categorySlug,
                status,
                pinned,
            }

            toast.success("Post criado com sucesso!")

            // ✅ Redirecionar para listagem
            router.push("/admin/trilhas")
        } catch (e: any) {
            console.error(e)
            toast.error(e.message || "Erro ao criar post")
            setIsSaving(false) // só libera se der erro
        }
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
            setPendingNavigation("/admin/trilhas")
        } else {
            router.push("/admin/trilhas")
        }
    }

    const handleConfirmNavigation = () => {
        setShowUnsavedDialog(false)
        if (pendingNavigation) router.push(pendingNavigation)
    }

    const breadcrumbItems = [
        { label: "Home", href: "/admin/dashboard" },
        { label: "Trilhas", href: "/admin/trilhas" },
        { label: "Novo" },
    ]

    return (
        <>
            <TrilhasAdminShell
                pageTitle="Novo post (Trilhas)"
                breadcrumbItems={breadcrumbItems}
                editorActions={{
                    isDirty,
                    isSaving,
                    onCancel: handleCancel,
                    onSaveDraft: () => handleSave("DRAFT"),
                    onPublish: () => handleSave("PUBLISHED"),
                }}
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Button
                            variant={activeTab === "edit" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab("edit")}
                            className={cn("h-9 px-3 text-sm shrink-0 relative", activeTab === "edit" && "font-semibold")}
                        >
                            <Edit className="size-4 mr-2" />
                            Editar Conteúdo
                            {hasEditErrors && (
                                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </Button>
                        <Button
                            variant={activeTab === "preview" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab("preview")}
                            className={cn("h-9 px-3 text-sm shrink-0", activeTab === "preview" && "font-semibold")}
                        >
                            <Eye className="size-4 mr-2" />
                            Prévia Realista
                        </Button>
                        <Button
                            variant={activeTab === "metadata" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab("metadata")}
                            className={cn("h-9 px-3 text-sm shrink-0 relative", activeTab === "metadata" && "font-semibold")}
                        >
                            <Settings className="size-4 mr-2" />
                            Configurações & SEO
                            {hasMetadataErrors && (
                                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                            )}
                        </Button>
                    </div>

                    <div className="min-h-[500px]">
                        {activeTab === "edit" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-0 sm:p-6 border-none sm:border shadow-none sm:shadow-sm">
                                    <TrilhasEditor
                                        title={title}
                                        excerpt={excerpt}
                                        content={content}
                                        onTitleChange={setTitle}
                                        onExcerptChange={setExcerpt}
                                        onContentChange={setContent}
                                    />
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "preview" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-6">
                                    <div className="max-w-7xl mx-auto">
                                        <TrilhasPreview title={title} content={content} />
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "metadata" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <Card className="p-6 space-y-4">
                                    <Label className="text-base font-semibold mb-6 block border-b pb-2">
                                        Configurações da Publicação
                                    </Label>
                                    <TrilhasMetadataPanel
                                        slug={slug}
                                        onSlugChange={(v) => {
                                            const next = v
                                            setSlug(next)
                                            setSlugTouched(!!next.trim())
                                        }}
                                        slugError={slugError}
                                        status={status}
                                        onStatusChange={setStatus}
                                        pinned={pinned}
                                        onPinnedChange={setPinned}
                                        categorySlug={categorySlug}
                                        onCategorySlugChange={setCategorySlug}
                                        categories={categories}
                                    />
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </TrilhasAdminShell>

            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mudanças não salvas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você tem mudanças não salvas. Deseja realmente sair? Tudo será perdido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
                            Continuar editando
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmNavigation}>Sair sem salvar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

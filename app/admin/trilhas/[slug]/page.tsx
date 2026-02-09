"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Edit, Eye, Settings, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TrilhasEditor } from "@/components/features/admin/trilhas/forms/TrilhasEditor"
import { TrilhasPreview } from "@/components/features/admin/trilhas/preview/TrilhasPreview"
import {
    TrilhasMetadataPanel,
    type TrilhasStatus,
} from "@/components/features/admin/trilhas/forms/TrilhasMetadataPanel"
import { TrilhasAdminShell } from "@/components/features/admin/trilhas/shell/TrilhasAdminShell";
import { fetchJson } from "@/lib/http";

type Category = {
    id: string;
    name: string;
    slug: string;
    color: string | null;
};

type Post = {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    status: TrilhasStatus;
    pinned: boolean;
    updatedAt?: string;
    category: { slug: string; name: string; color: string | null };
};

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

type EditorTab = "edit" | "preview" | "metadata" | "feedbacks";

export default function EditTrilhasPostPage() {
    const router = useRouter();
    const isMobile = useIsMobile();

    const params = useParams();
    const rawSlug = (params as any)?.slug as string | string[] | undefined;

    const routeSlug = useMemo(() => {
        if (!rawSlug) return "";
        const s = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
        return decodeURIComponent(String(s)).trim();
    }, [rawSlug]);

    const [isLoading, setIsLoading] = useState(true);

    const [categories, setCategories] = useState<Category[]>([]);
    const [postId, setPostId] = useState("");

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [slug, setSlug] = useState("");
    const [categorySlug, setCategorySlug] = useState("");
    const [status, setStatus] = useState<TrilhasStatus>("DRAFT");
    const [pinned, setPinned] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [slugError, setSlugError] = useState("");
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null
    );

    // Validações para indicadores nas abas
    const hasEditErrors = !title.trim() || !excerpt.trim();
    const hasMetadataErrors = !slug.trim() || !categorySlug.trim() || !!slugError;
    const [activeTab, setActiveTab] = useState<EditorTab>("edit");
    const [postFeedbacks, setPostFeedbacks] = useState<any[]>([]);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

    const initialRef = useRef({
        title: "",
        excerpt: "",
        content: "",
        slug: "",
        categorySlug: "",
        status: "DRAFT" as TrilhasStatus,
        pinned: false,
    });

    const isDirty = useMemo(() => {
        const i = initialRef.current;
        return (
            title !== i.title ||
            excerpt !== i.excerpt ||
            content !== i.content ||
            slug !== i.slug ||
            categorySlug !== i.categorySlug ||
            status !== i.status ||
            pinned !== i.pinned
        );
    }, [title, excerpt, content, slug, categorySlug, status, pinned]);

    /* =============================
     * categorias
     * ============================= */
    useEffect(() => {
        fetchJson<{ categories: Category[] }>("/api/admin/trilhas/categories")
            .then((d) => setCategories(d.categories || []))
            .catch((e) =>
                toast.error(e.message || "Erro ao carregar categorias")
            );
    }, []);

    useEffect(() => {
        if (activeTab === "feedbacks" && postId) {
            setIsLoadingFeedbacks(true);
            fetchJson<{ feedbacks: any[] }>(`/api/admin/trilhas/feedbacks?postId=${postId}`)
                .then((d) => setPostFeedbacks(d.feedbacks || []))
                .catch((e) => toast.error(e.message || "Erro ao carregar feedbacks"))
                .finally(() => setIsLoadingFeedbacks(false));
        }
    }, [activeTab, postId]);

    /* =============================
     * carregar post (slug)
     * ============================= */
    useEffect(() => {
        // ⛔ ainda não sabemos se params chegou
        if (rawSlug === undefined) return;

        // ❌ params chegou, mas slug veio vazio
        if (!routeSlug) {
            toast.error("Slug inválido na URL");
            router.replace("/admin/trilhas");
            return;
        }

        setIsLoading(true);

        fetchJson<{ post: Post }>(
            `/api/admin/trilhas/slug/${encodeURIComponent(routeSlug)}`
        )
            .then(({ post }) => {
                setPostId(post.id);
                setTitle(post.title);
                setExcerpt(post.excerpt);
                setContent(post.content);
                setSlug(post.slug);
                setCategorySlug(post.category?.slug || "");
                setStatus(post.status);
                setPinned(!!post.pinned);

                initialRef.current = {
                    title: post.title,
                    excerpt: post.excerpt,
                    content: post.content,
                    slug: post.slug,
                    categorySlug: post.category?.slug || "",
                    status: post.status,
                    pinned: !!post.pinned,
                };
            })
            .catch((e) =>
                toast.error(e.message || "Erro ao carregar post")
            )
            .finally(() => setIsLoading(false));
    }, [rawSlug, routeSlug, router]);

    /* =============================
     * auto slug
     * ============================= */
    useEffect(() => {
        if (!title.trim()) return;
        if (!slug.trim()) setSlug(generateSlug(title));
    }, [title]); // intencional

    /* =============================
     * valida slug (ignora o próprio post)
     * ============================= */
    useEffect(() => {
        if (!slug.trim() || !postId) {
            setSlugError("");
            return;
        }

        const t = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/admin/trilhas/slug/${encodeURIComponent(slug)}`
                );

                if (res.status === 404) {
                    setSlugError("");
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    if (data?.post?.id && data.post.id !== postId) {
                        setSlugError("Este slug já está em uso");
                    } else {
                        setSlugError("");
                    }
                }
            } catch {
                setSlugError("");
            }
        }, 400);

        return () => clearTimeout(t);
    }, [slug, postId]);

    /* =============================
     * salvar
     * ============================= */
    const handleSave = async (nextStatus: TrilhasStatus) => {
        if (!postId) return toast.error("Post não carregado");
        if (!title.trim()) return toast.error("Título obrigatório");
        if (!excerpt.trim()) return toast.error("Resumo obrigatório");
        if (!slug.trim()) return toast.error("Slug obrigatório");
        if (!categorySlug.trim())
            return toast.error("Categoria obrigatória");
        if (slugError) return toast.error(slugError);

        setIsSaving(true);
        try {
            const data = await fetchJson<{ post: { id: string; slug: string } }>(
                `/api/admin/trilhas/by-id/${encodeURIComponent(postId)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        excerpt,
                        content,
                        slug,
                        categorySlug,
                        status: nextStatus,
                        pinned,
                    }),
                }
            );

            toast.success("Post atualizado");

            initialRef.current = {
                title,
                excerpt,
                content,
                slug,
                categorySlug,
                status: nextStatus,
                pinned,
            };
            setStatus(nextStatus);

            if (data.post.slug !== routeSlug) {
                router.replace(`/admin/trilhas/${data.post.slug}`);
            }
        } catch (e: any) {
            toast.error(e.message || "Erro ao salvar");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            setShowUnsavedDialog(true);
            setPendingNavigation("/admin/trilhas");
        } else {
            router.push("/admin/trilhas");
        }
    };


    const handleDelete = async () => {
        if (!postId) return

        setIsSaving(true)
        try {
            await fetchJson(`/api/admin/trilhas/by-id/${encodeURIComponent(postId)}`, {
                method: "DELETE",
            })
            toast.success("Post excluído com sucesso")
            router.replace("/admin/trilhas")
        } catch (e: any) {
            toast.error(e.message || "Erro ao excluir post")
            setIsSaving(false)
        }
    }

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    if (isLoading) {
        return (
            <TrilhasAdminShell pageTitle="Carregando..." breadcrumbItems={[]}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-4 space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </Card>
                    <Card className="p-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </Card>
                </div>
            </TrilhasAdminShell>
        );
    }

    return (
        <>
            <TrilhasAdminShell
                pageTitle="Editar post (Trilhas)"
                breadcrumbItems={[
                    { label: "Home", href: "/admin/dashboard" },
                    { label: "Trilhas", href: "/admin/trilhas" },
                    { label: "Editar" },
                ]}
                editorActions={{
                    isDirty,
                    isSaving,
                    onCancel: handleCancel,
                    onSaveDraft: () => handleSave("DRAFT"),
                    onPublish: () => handleSave("PUBLISHED"),
                    onDelete: () => setShowDeleteDialog(true),
                    viewLiveUrl: status === "PUBLISHED" ? `/trilhas/${routeSlug}` : undefined
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
                        <Button
                            variant={activeTab === "feedbacks" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setActiveTab("feedbacks")}
                            className={cn("h-9 px-3 text-sm shrink-0", activeTab === "feedbacks" && "font-semibold")}
                        >
                            <MessageSquare className="size-4 mr-2" />
                            Feedbacks
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
                                <Card className="p-6">
                                    <Label className="text-base font-semibold mb-6 block border-b pb-2">
                                        Configurações da Publicação
                                    </Label>
                                    <TrilhasMetadataPanel
                                        slug={slug}
                                        onSlugChange={setSlug}
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

                        {activeTab === "feedbacks" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Feedbacks da Trilha</h3>
                                            <p className="text-sm text-slate-500">Acompanhe as avaliações dos usuários para este conteúdo.</p>
                                        </div>
                                    </div>

                                    {isLoadingFeedbacks ? (
                                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {/* Reuse existing component or implement post-specific view */}
                                            {/* Since FeedbackList is designed for global, it might show redundant info, 
                                                but for now it's better than nothing. */}
                                            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                                                {postFeedbacks.length === 0 ? (
                                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                                        <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                                                        <h3 className="text-lg font-medium text-slate-900">Nenhum feedback ainda</h3>
                                                        <p className="text-sm text-slate-500 max-w-xs mt-1">
                                                            Ainda não há avaliações para esta trilha específica.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    postFeedbacks.map((f, i) => (
                                                        <motion.div
                                                            key={f.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                        >
                                                            <Card className="h-full border-border/50 hover:border-border transition-colors">
                                                                <CardContent className="p-5 flex flex-col h-full">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="flex gap-0.5">
                                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                                <Star
                                                                                    key={s}
                                                                                    className={`h-3.5 w-3.5 ${s <= f.rating
                                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                                        : "text-slate-200"
                                                                                        }`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                                                                            {new Date(f.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </div>
                                                                    </div>

                                                                    {f.comment ? (
                                                                        <div className="mt-1 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 italic flex-1 border border-slate-100">
                                                                            "{f.comment}"
                                                                        </div>
                                                                    ) : (
                                                                        <div className="mt-1 text-xs text-slate-400 bg-slate-50/50 rounded-lg p-3 border border-dashed flex-1 flex items-center justify-center">
                                                                            Apenas avaliação por estrelas
                                                                        </div>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
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
                            Você tem mudanças não salvas. Deseja realmente sair?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                pendingNavigation && router.push(pendingNavigation)
                            }
                        >
                            Sair sem salvar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive  text-white hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Edit, Eye, Settings } from "lucide-react";
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
import { TrilhasEditor } from "@/components/features/admin/trilhas/TrilhasEditor";
import { TrilhasPreview } from "@/components/features/admin/trilhas/TrilhasPreview";
import {
    TrilhasMetadataPanel,
    type TrilhasStatus,
} from "@/components/features/admin/trilhas/TrilhasMetadataPanel";
import { TrilhasAdminShell } from "@/components/features/admin/trilhas/TrilhasAdminShell";
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

type EditorTab = "edit" | "preview" | "metadata";

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
    const [activeTab, setActiveTab] = useState<EditorTab>("edit");

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

    if (isLoading) {
        return (
            <TrilhasAdminShell pageTitle="Carregando..." breadcrumbItems={[]}>
                <Card className="p-6">Carregando post…</Card>
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
                }}
            >
                {isMobile ? (
                    <div className="space-y-4">
                        <div className="flex gap-1 overflow-x-auto">
                            <Button
                                size="sm"
                                variant={activeTab === "edit" ? "default" : "ghost"}
                                onClick={() => setActiveTab("edit")}
                            >
                                <Edit className="size-4 mr-2" /> Editar
                            </Button>
                            <Button
                                size="sm"
                                variant={activeTab === "preview" ? "default" : "ghost"}
                                onClick={() => setActiveTab("preview")}
                            >
                                <Eye className="size-4 mr-2" /> Prévia
                            </Button>
                            <Button
                                size="sm"
                                variant={activeTab === "metadata" ? "default" : "ghost"}
                                onClick={() => setActiveTab("metadata")}
                            >
                                <Settings className="size-4 mr-2" /> Metadados
                            </Button>
                        </div>

                        {activeTab === "edit" && (
                            <Card className="p-4">
                                <TrilhasEditor
                                    title={title}
                                    excerpt={excerpt}
                                    content={content}
                                    onTitleChange={setTitle}
                                    onExcerptChange={setExcerpt}
                                    onContentChange={setContent}
                                />
                            </Card>
                        )}

                        {activeTab === "preview" && (
                            <Card className="p-4">
                                <TrilhasPreview title={title} content={content} />
                            </Card>
                        )}

                        {activeTab === "metadata" && (
                            <Card className="p-4">
                                <Label className="mb-3 block">Metadados</Label>
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
                        )}
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <Card className="p-4">
                                <TrilhasEditor
                                    title={title}
                                    excerpt={excerpt}
                                    content={content}
                                    onTitleChange={setTitle}
                                    onExcerptChange={setExcerpt}
                                    onContentChange={setContent}
                                />
                            </Card>

                            <Card className="p-4">
                                <Label className="mb-3 block">Metadados</Label>
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
                        </div>

                        <Card className="sticky top-6 p-4">
                            <TrilhasPreview title={title} content={content} />
                        </Card>
                    </div>
                )}
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
        </>
    );
}

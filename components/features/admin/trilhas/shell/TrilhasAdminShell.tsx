"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowLeft, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

type BreadcrumbItem = { label: string; href?: string }

type EditorActions = {
    isDirty?: boolean
    isSaving?: boolean
    onCancel?: () => void
    onSaveDraft?: () => void
    onPublish?: () => void
    onDelete?: () => void
    viewLiveUrl?: string
}

export function TrilhasAdminShell(props: {
    pageTitle: string
    breadcrumbItems?: BreadcrumbItem[]
    editorActions?: EditorActions
    // ✅ NOVO (para listagem)
    searchInput?: ReactNode
    sidebarExtra?: ReactNode
    // ✅ Layout opcional para listagem
    contentClassName?: string
    children: ReactNode
    className?: string
}) {
    const {
        pageTitle,
        breadcrumbItems,
        editorActions,
        searchInput,
        sidebarExtra,
        contentClassName,
        children,
        className,
    } = props

    const hasSidebar = Boolean(searchInput || sidebarExtra)

    return (
        <div className="min-h-[calc(100vh-64px)] w-full">
            <div className={cn("mx-auto w-full  px-4 sm:px-6 lg:px-8 py-6", className)}>
                {/* Header */}
                <div className="mb-6">
                    {/* Breadcrumb */}
                    {breadcrumbItems?.length ? (
                        <nav className="mb-3 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {breadcrumbItems.map((item, idx) => (
                                <span key={`${item.label}-${idx}`} className="flex items-center gap-2">
                                    {item.href ? (
                                        <Link href={item.href} className="hover:text-foreground transition-colors">
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground">{item.label}</span>
                                    )}
                                    {idx < breadcrumbItems.length - 1 ? <ChevronRight className="size-3.5" /> : null}
                                </span>
                            ))}
                        </nav>
                    ) : null}

                    {/* Title + Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">{pageTitle}</h1>
                            {editorActions?.isDirty ? (
                                <p className="mt-1 text-xs text-muted-foreground">Alterações não salvas</p>
                            ) : null}
                        </div>

                        {editorActions ? (
                            <div className="flex items-center gap-2">
                                {editorActions.viewLiveUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        asChild
                                        className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
                                    >
                                        <Link href={editorActions.viewLiveUrl} target="_blank">
                                            <ExternalLink className="size-4 mr-2" />
                                            Ver no Site
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={editorActions.onCancel}
                                    disabled={editorActions.isSaving}
                                >
                                    <ArrowLeft className="size-4 mr-2" />
                                    Voltar
                                </Button>

                                <Button
                                    type="button"
                                    onClick={editorActions.onPublish}
                                    disabled={editorActions.isSaving}
                                    className="min-w-[100px]"
                                >
                                    {editorActions.isSaving ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Salvando...
                                        </>
                                    ) : (
                                        "Publicar"
                                    )}
                                </Button>

                                {editorActions.onDelete ? (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={editorActions.onDelete}
                                        disabled={editorActions.isSaving}
                                    >
                                        Excluir
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* ✅ Layout para listagem (com sidebar) */}
                {hasSidebar ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                        <aside className="space-y-4">
                            {searchInput ? <div>{searchInput}</div> : null}
                            {sidebarExtra ? (
                                <div className="rounded-xl border border-border/50 bg-card p-4">{sidebarExtra}</div>
                            ) : null}
                        </aside>

                        <main className={cn("min-w-0", contentClassName)}>{children}</main>
                    </div>
                ) : (
                    /* ✅ Layout normal (sem sidebar), usado no new/edit */
                    <div className={cn("", contentClassName)}>{children}</div>
                )}
            </div>
        </div>
    )
}

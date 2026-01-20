"use client"

import { ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Plus, FileText, HelpCircle, ChevronRight, Star, Clock, MoreVertical, Copy, History, Archive, Edit, Save, Globe, X, Menu } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DocMetadata {
  status: "draft" | "published"
  category: string
  updatedAt: string
  authorName: string
  archived?: boolean
}

interface DocActions {
  onFavorite?: () => void
  isFavorite?: boolean
  editUrl?: string
  onCopyLink?: () => void
  onArchive?: () => void
  onUnarchive?: () => void
  isArchived?: boolean
  onArchiveClick?: () => void
  onDelete?: () => void
}

interface EditorActions {
  isDirty: boolean
  status: "draft" | "published"
  lastSaved?: Date
  isSaving?: boolean
  onCancel: () => void
  onSaveDraft: () => void
  onPublish: () => void
}

interface DocsShellProps {
  children: ReactNode
  pageTitle: string
  sidebarExtra?: ReactNode
  searchInput?: ReactNode
  breadcrumbItems?: BreadcrumbItem[]
  docMetadata?: DocMetadata
  docActions?: DocActions
  editorActions?: EditorActions
  hideSidebar?: boolean
}

export function DocsShell({
  children,
  pageTitle,
  sidebarExtra,
  searchInput,
  breadcrumbItems,
  docMetadata,
  docActions,
  editorActions,
  hideSidebar = false,
}: DocsShellProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatLastSaved = () => {
    if (!editorActions?.lastSaved) return "nunca"
    const now = new Date()
    const diffMs = now.getTime() - editorActions.lastSaved.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "agora"
    if (diffMins === 1) return "há 1 minuto"
    if (diffMins < 60) return `há ${diffMins} minutos`

    return editorActions.lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Conteúdo da sidebar (usado tanto na sidebar fixa quanto no drawer mobile)
  const sidebarContent = (
    <div className="p-5 space-y-6">
      {/* Busca no topo - acima de tudo */}
      {searchInput && (
        <div className="pb-5 border-b border-border/40">
          {searchInput}
        </div>
      )}

      {/* Seção Navegação */}
      <div>
        <nav className="space-y-1">
          <Link
            href="/admin/docs"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/admin/docs"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <FileText className="size-4" />
            <span>Todos os documentos</span>
          </Link>
          <Link
            href="/admin/docs/favorites"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/admin/docs/favorites"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <Star className="size-4" />
            <span>Favoritos</span>
          </Link>
          <Link
            href="/admin/docs/recent"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === "/admin/docs/recent"
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <Clock className="size-4" />
            <span>Recentes</span>
          </Link>
        </nav>
      </div>

      {sidebarExtra && (
        <div className="pt-4 border-t border-border/40">
          {sidebarExtra}
        </div>
      )}
    </div>
  )

  const effectiveBreadcrumb: BreadcrumbItem[] =
    breadcrumbItems ?? [
      { label: "Home", href: "/admin/dashboard" },
      { label: "Documentação" },
    ]

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex h-full w-full flex-col min-h-full">
      {/* Header fixo */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          {editorActions ? (
            /* Layout para editor: título + ações compactas */
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Breadcrumb - oculto no mobile muito pequeno */}
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                {effectiveBreadcrumb.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="size-3 sm:size-3.5" />}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-foreground">{item.label}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Título e ações em linha compacta */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground leading-tight line-clamp-2">
                    {pageTitle}
                  </h1>
                </div>

                {/* Ações compactas - apenas ícones no mobile muito pequeno */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Status - apenas no desktop grande */}
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    {editorActions.isDirty ? (
                      <span className="text-amber-600 dark:text-amber-500">
                        Não salvo
                      </span>
                    ) : (
                      <span>Salvo</span>
                    )}
                    {editorActions.lastSaved && (
                      <>
                        <span>•</span>
                        <span>{formatLastSaved()}</span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={editorActions.onCancel}
                    disabled={editorActions.isSaving}
                    className="h-8 w-8 sm:w-auto sm:h-9 sm:px-3 text-xs sm:text-sm p-0 shrink-0"
                    title="Cancelar"
                  >
                    <X className="size-4" />
                    <span className="hidden sm:inline sm:ml-1.5">Cancelar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={editorActions.onSaveDraft}
                    disabled={editorActions.isSaving || !editorActions.isDirty}
                    className="h-8 w-8 sm:w-auto sm:h-9 sm:px-3 text-xs sm:text-sm p-0 shrink-0"
                    title="Salvar rascunho"
                  >
                    <Save className="size-4" />
                    <span className="hidden sm:inline sm:ml-1.5">Rascunho</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={editorActions.onPublish}
                    disabled={editorActions.isSaving || !editorActions.isDirty}
                    className="h-8 w-8 sm:w-auto sm:h-9 sm:px-3 text-xs sm:text-sm p-0 shrink-0"
                    title={editorActions.status === "published" ? "Atualizar" : "Publicar"}
                  >
                    <Globe className="size-4" />
                    <span className="hidden sm:inline sm:ml-1.5">
                      {editorActions.status === "published" ? "Atualizar" : "Publicar"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Layout padrão: título + metadados + ações */
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              {/* Esquerda: Breadcrumb e Título */}
              <div className="flex-1 min-w-0">
                {/* Breadcrumb - oculto em mobile muito pequeno */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {effectiveBreadcrumb.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="size-3.5" />}
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {pageTitle}
                </h1>

                {/* Metadados do documento ou subtítulo padrão */}
                {docMetadata ? (
                  <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={docMetadata.status === "published" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {docMetadata.status === "published" ? "Publicado" : "Rascunho"}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {docMetadata.category}
                      </Badge>
                      {docMetadata.archived && (
                        <Badge variant="outline" className="text-xs border-dashed border-orange-400 text-orange-500">
                          Arquivado
                        </Badge>
                      )}
                    </div>
                    <Separator orientation="vertical" className="h-3" />
                    <span>Atualizado em {formatDate(docMetadata.updatedAt)}</span>
                    <Separator orientation="vertical" className="h-3" />
                    <span>
                      Autor: <span className="font-medium text-foreground">{docMetadata.authorName}</span>
                    </span>
                  </div>
                ) : (
                  <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
                    Base de conhecimento e procedimentos internos
                  </p>
                )}
              </div>

              {/* Direita: Botões e Ações */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Botão Menu para mobile (quando não está escondendo sidebar) */}
                {!hideSidebar && isMobile && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 md:hidden"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <Menu className="size-4" />
                  </Button>
                )}

                {/* Ações do documento (se houver) */}
                {docActions && (
                  <>
                    {docActions.onFavorite && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={docActions.onFavorite}
                      >
                        <Star
                          className={cn(
                            "size-4",
                            docActions.isFavorite
                              ? "fill-amber-500 text-amber-500"
                              : "text-muted-foreground"
                          )}
                        />
                      </Button>
                    )}
                    {docActions.editUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9"
                      >
                        <Link href={docActions.editUrl}>
                          <Edit className="size-4 mr-2" />
                          <span className="hidden sm:inline">Editar</span>
                          <span className="sm:hidden">Editar</span>
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {docActions.onCopyLink && (
                          <DropdownMenuItem onClick={docActions.onCopyLink}>
                            <Copy className="size-4 mr-2" />
                            Copiar link
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled>
                          <History className="size-4 mr-2" />
                          Ver histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {docActions.isArchived ? (
                          docActions.onUnarchive && (
                            <DropdownMenuItem onClick={docActions.onUnarchive}>
                              <Archive className="size-4 mr-2" />
                              Restaurar
                            </DropdownMenuItem>
                          )
                        ) : (
                          docActions.onArchiveClick && (
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                docActions.onArchiveClick?.()
                              }}
                            >
                              <Archive className="size-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                          )
                        )}
                        {docActions.onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault()
                                docActions.onDelete?.()
                              }}
                            >
                              <X className="size-4 mr-2" />
                              Excluir documento
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                <Button
                  asChild
                  size="sm"
                  className="h-9 px-2 sm:px-3 md:px-4 text-xs sm:text-sm"
                >
                  <Link href="/admin/docs/new">
                    <Plus className="size-4 sm:mr-2" />
                    <span className="hidden sm:inline">Novo documento</span>
                    <span className="sm:hidden">Novo</span>
                  </Link>
                </Button>

                {/* Templates e Ajuda - ocultos no mobile */}
                <div className="hidden md:flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-9 px-3 sm:px-4 text-xs sm:text-sm"
                      >
                        <FileText className="size-4 mr-2" />
                        <span className="hidden sm:inline">Templates</span>
                        <span className="sm:hidden">Templates</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>Em breve</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        disabled
                      >
                        <HelpCircle className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Como usar a documentação</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Container principal: Sidebar + Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar esquerda - Desktop (fixa) */}
        {!hideSidebar && !isMobile && (
          <aside className="hidden md:block w-64 shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm overflow-y-auto">
            {sidebarContent}
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Sheet (Drawer) para mobile */}
      {!hideSidebar && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="h-full overflow-y-auto">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Archive, Plus, Calendar } from "lucide-react"
import { ProjectListItem } from "../project.types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProjectHeaderProps {
  project: ProjectListItem
  onBack: () => void
  onEdit: () => void
  onArchive: () => void
  onCreateTask: () => void
}

export function ProjectHeader({
  project,
  onBack,
  onEdit,
  onArchive,
  onCreateTask,
}: ProjectHeaderProps) {
  const updatedDate = new Date(project.updatedAt)
  const timeAgo = formatDistanceToNow(updatedDate, {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4">
        {/* Mobile: Layout compacto */}
        <div className="md:hidden space-y-2.5">
          {/* Linha 1: Voltar, Título e ações principais */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 -ml-1 shrink-0">
                <ArrowLeft className="size-4" />
              </Button>
              <h1 className="text-lg font-bold text-foreground line-clamp-1 truncate">
                {project.name}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                <Edit className="size-4" />
              </Button>
              <Button variant="default" size="sm" onClick={onCreateTask} className="h-8 px-3">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Layout completo */}
        <div className="hidden md:block">
          {/* Linha 1: Navegação e ações */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
                <ArrowLeft className="size-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Projeto</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="size-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={onArchive}>
                <Archive className="size-4 mr-2" />
                {project.status === "ARCHIVED" ? "Ativar" : "Arquivar"}
              </Button>
              <Button variant="default" size="sm" onClick={onCreateTask}>
                <Plus className="size-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          </div>

          {/* Linha 2: Título e info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>
                  {project._count?.tasks || 0} tarefa{project._count?.tasks !== 1 ? "s" : ""} • atualizado {timeAgo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


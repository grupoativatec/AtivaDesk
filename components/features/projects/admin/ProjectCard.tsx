"use client"

import { ProjectListItem } from "./project.types"
import { ProjectStatusBadge } from "./ProjectStatusBadge"
import { ProjectUnitBadge } from "./ProjectUnitBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Edit, Archive, FolderKanban } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: ProjectListItem
  onEdit?: (project: ProjectListItem) => void
  onArchive?: (project: ProjectListItem) => void
}

export function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCardClick = () => {
    const currentQuery = searchParams.toString()
    const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname
    router.push(`/admin/projetos/${project.id}?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onArchive) {
      onArchive(project)
    }
  }

  const updatedDate = new Date(project.updatedAt)
  const timeAgo = formatDistanceToNow(updatedDate, {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div
      className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-5 shadow-sm dark:shadow-none cursor-pointer hover:shadow-md dark:hover:shadow-none hover:bg-muted/30 dark:hover:bg-muted/10 transition-all flex flex-col"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="size-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold text-sm text-foreground line-clamp-2">
              {project.name}
            </h3>
          </div>
          {project.code && (
            <Badge variant="outline" className="text-xs font-mono mb-2">
              {project.code}
            </Badge>
          )}
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {project.unit && <ProjectUnitBadge unit={project.unit} />}
      </div>

      {/* Info */}
      <div className="space-y-2 text-xs text-muted-foreground mb-4 flex-1">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-3.5" />
          <span>{project._count?.tasks || 0} tarefa{project._count?.tasks !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5" />
          <span>
            {format(updatedDate, "dd/MM/yyyy", { locale: ptBR })} • {timeAgo}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="flex-1"
        >
          <Edit className="size-3 mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          className="flex-1"
        >
          <Archive className="size-3 mr-2" />
          {project.status === "ARCHIVED" ? "Desarquivar" : "Arquivar"}
        </Button>
      </div>
    </div>
  )
}


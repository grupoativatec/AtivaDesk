"use client"

import { ProjectListItem } from "./project.types"
import { ProjectStatusBadge } from "./ProjectStatusBadge"
import { ProjectUnitBadge } from "./ProjectUnitBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Edit, Archive } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface ProjectTableProps {
  projects: ProjectListItem[]
  onEdit?: (project: ProjectListItem) => void
  onArchive?: (project: ProjectListItem) => void
}

export function ProjectTable({ projects, onEdit, onArchive }: ProjectTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleRowClick = (projectId: string) => {
    const currentQuery = searchParams.toString()
    const returnTo = currentQuery ? `${pathname}?${currentQuery}` : pathname
    router.push(`/admin/projetos/${projectId}?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const handleEdit = (e: React.MouseEvent, project: ProjectListItem) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleArchive = (e: React.MouseEvent, project: ProjectListItem) => {
    e.stopPropagation()
    if (onArchive) {
      onArchive(project)
    }
  }

  return (
    <>
      {/* Tabela Desktop */}
      <div className="hidden lg:block">
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 dark:bg-muted/10 border-b border-border dark:border-border/30">
                <tr>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tarefas
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Atualizado
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border/20">
                {projects.map((project) => {
                  const updatedDate = new Date(project.updatedAt)
                  const timeAgo = formatDistanceToNow(updatedDate, {
                    addSuffix: true,
                    locale: ptBR,
                  })

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(project.id)}
                    >
                      <td className="p-4">
                        <span className="font-medium text-sm text-foreground">
                          {project.name}
                        </span>
                      </td>
                      <td className="p-4">
                        {project.code ? (
                          <Badge variant="outline" className="text-xs font-mono">
                            {project.code}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Sem código
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {project.unit ? (
                          <ProjectUnitBadge unit={project.unit} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {project._count?.tasks || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-3.5" />
                          <div className="flex flex-col">
                            <span>{format(updatedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                            <span className="text-xs">{timeAgo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => handleEdit(e, project)}
                            className="h-8"
                          >
                            <Edit className="size-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e: React.MouseEvent) => handleArchive(e, project)}
                            className="h-8"
                          >
                            <Archive className="size-4 mr-2" />
                            {project.status === "ARCHIVED" ? "Desarquivar" : "Arquivar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="lg:hidden space-y-4">
        {projects.map((project) => {
          const updatedDate = new Date(project.updatedAt)
          const timeAgo = formatDistanceToNow(updatedDate, {
            addSuffix: true,
            locale: ptBR,
          })

          return (
            <div
              key={project.id}
              className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/10 transition-all"
              onClick={() => handleRowClick(project.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                    {project.name}
                  </h3>
                  {project.code && (
                    <Badge variant="outline" className="text-xs font-mono mb-2">
                      {project.code}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0 ml-2">
                  <ProjectStatusBadge status={project.status} />
                  {project.unit && <ProjectUnitBadge unit={project.unit} />}
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Tarefas: {project._count?.tasks || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5" />
                  <span>
                    {format(updatedDate, "dd/MM/yyyy", { locale: ptBR })} • {timeAgo}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleEdit(e, project)}
                  className="flex-1"
                >
                  <Edit className="size-3 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleArchive(e, project)}
                  className="flex-1"
                >
                  <Archive className="size-3 mr-2" />
                  {project.status === "ARCHIVED" ? "Desarquivar" : "Arquivar"}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}


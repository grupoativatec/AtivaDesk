"use client"

import { ProjectListItem } from "../project.types"
import { ProjectStatusBadge } from "../ProjectStatusBadge"
import { ProjectUnitBadge } from "../ProjectUnitBadge"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { TaskListItem } from "@/components/features/admin/tasks/task.types"

interface ProjectSummaryPanelProps {
  project: ProjectListItem
  tasks: TaskListItem[]
  totalHours: number
}

function formatHours(hours: number) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(hours)
}

export function ProjectSummaryPanel({ project, tasks, totalHours }: ProjectSummaryPanelProps) {
  const createdDate = new Date(project.createdAt)
  const updatedDate = new Date(project.updatedAt)

  const taskDistribution = {
    active: tasks.filter((t) => t.status !== "DONE").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile: Cards horizontais compactos */}
      <div className="md:hidden space-y-2.5">
        {/* KPI: Horas - Mobile compacto */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Horas</div>
              <div className="mt-0.5 text-xl font-bold text-foreground tabular-nums">
                {formatHours(totalHours)}h
              </div>
            </div>
            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="size-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Distribuição de Tarefas - Mobile compacto */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 shadow-sm dark:shadow-none">
          <h3 className="text-xs font-semibold text-foreground mb-2.5">Tarefas</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{taskDistribution.active}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-500">{taskDistribution.done}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Concluídas</div>
            </div>
          </div>
        </div>

        {/* Status e Info - Mobile compacto */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-3 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 flex-wrap">
            <ProjectStatusBadge status={project.status} />
            {project.unit && <ProjectUnitBadge unit={project.unit} />}
            {project.code && (
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                {project.code}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Desktop: Cards completos */}
      <div className="hidden md:block space-y-4">
        {/* KPI: Horas */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Horas lançadas</div>
              <div className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                {formatHours(totalHours)}h
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Somatório de apontamentos das tarefas
              </div>
            </div>
            <div className="size-9 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="size-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Resumo do Projeto */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-foreground mb-3">Resumo do Projeto</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <ProjectStatusBadge status={project.status} />
            </div>

            {project.unit && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Unidade</div>
                <ProjectUnitBadge unit={project.unit} />
              </div>
            )}

            {project.code && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Código</div>
                <Badge variant="outline" className="text-xs font-mono">
                  {project.code}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Datas */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-foreground mb-3">Datas</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Criado em {format(createdDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Atualizado em {format(updatedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </div>

        {/* Distribuição de Tarefas */}
        <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribuição de Tarefas</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Ativas</span>
              </div>
              <span className="font-semibold text-foreground">{taskDistribution.active}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-500" />
                <span className="text-muted-foreground">Concluídas</span>
              </div>
              <span className="font-semibold text-foreground">{taskDistribution.done}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

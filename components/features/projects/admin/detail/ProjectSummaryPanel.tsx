"use client"

import { ProjectListItem } from "../project.types"
import { ProjectStatusBadge } from "../ProjectStatusBadge"
import { ProjectUnitBadge } from "../ProjectUnitBadge"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, CheckCircle2, Ban, Clock } from "lucide-react"
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
    active: tasks.filter((t) => t.status !== "DONE" && t.status !== "BLOCKED").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    blocked: tasks.filter((t) => t.status === "BLOCKED").length,
  }

  return (
    <div className="space-y-4">
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
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Ban className="size-3.5 text-red-600 dark:text-red-500" />
              <span className="text-muted-foreground">Bloqueadas</span>
            </div>
            <span className="font-semibold text-foreground">{taskDistribution.blocked}</span>
          </div>
        </div>
      </div>

      {/* Stub */}
      <div className="bg-card dark:bg-card/30 border border-border dark:border-border/30 rounded-lg p-4 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-semibold text-foreground mb-3">Atividade Recente</h3>
        <p className="text-xs text-muted-foreground italic">Em breve</p>
      </div>
    </div>
  )
}

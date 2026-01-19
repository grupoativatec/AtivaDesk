"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProjectHeader } from "./ProjectHeader"
import { ProjectTasksPanel } from "./ProjectTasksPanel"
import { ProjectSummaryPanel } from "./ProjectSummaryPanel"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderKanban, ArrowLeft } from "lucide-react"
import { getProjectById, updateProject } from "@/lib/api/projects"
import { listTasks } from "@/lib/api/tasks"
import { ProjectListItem } from "../project.types"
import { TaskListItem } from "@/components/features/admin/tasks/task.types"
import { toast } from "sonner"

interface ProjectDetailShellProps {
  projectId: string
  onEdit: (project: ProjectListItem) => void
  onCreateTask: () => void
}

type ProjectDetailResponse = {
  project: ProjectListItem
  metrics?: {
    totalHours?: number
  }
}

export function ProjectDetailShell({
  projectId,
  onEdit,
  onCreateTask,
}: ProjectDetailShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [project, setProject] = useState<ProjectListItem | null>(null)
  const [tasks, setTasks] = useState<TaskListItem[]>([])
  const [totalHours, setTotalHours] = useState<number>(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar projeto + métricas + tarefas
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [projectRes, tasksData] = await Promise.all([
          getProjectById(projectId) as Promise<ProjectDetailResponse>,
          listTasks({ project: projectId, pageSize: 100 }),
        ])

        if (!cancelled) {
          setProject(projectRes.project)
          setTotalHours(projectRes.metrics?.totalHours ?? 0)
          setTasks(tasksData.tasks)
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Erro ao carregar projeto:", err)
          const message = err instanceof Error ? err.message : "Erro ao carregar projeto"
          setError(message)
          toast.error(message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [projectId])

  const handleBack = () => {
    const returnTo = searchParams.get("returnTo")
    if (returnTo) {
      router.push(returnTo)
    } else {
      router.push("/admin/projetos")
    }
  }

  const handleEdit = () => {
    if (project) onEdit(project)
  }

  const reloadProject = async () => {
    const projectRes = (await getProjectById(projectId)) as ProjectDetailResponse
    setProject(projectRes.project)
    setTotalHours(projectRes.metrics?.totalHours ?? 0)
  }

  const handleArchive = async () => {
    if (!project) return

    const newStatus = project.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED"
    const action = newStatus === "ARCHIVED" ? "arquivar" : "ativar"

    try {
      const loadingToast = toast.loading(
        `${action === "arquivar" ? "Arquivando" : "Ativando"} projeto...`
      )

      await updateProject(project.id, { status: newStatus })

      toast.dismiss(loadingToast)
      toast.success(`Projeto ${action === "arquivar" ? "arquivado" : "ativado"} com sucesso!`)

      await reloadProject()
    } catch (err) {
      console.error("Erro ao arquivar projeto:", err)
      const message = err instanceof Error ? err.message : `Erro ao ${action} projeto`
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full">
        <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="w-full bg-muted/20 dark:bg-background/50 flex-1">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div>
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="w-full flex flex-col h-full">
        <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
        <div className="w-full bg-muted/20 dark:bg-background/50 flex-1">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FolderKanban className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {error ? "Erro ao carregar projeto" : "Projeto não encontrado"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error || "O projeto que você está procurando não existe"}
              </p>
              <Button variant="outline" onClick={handleBack}>
                Voltar para projetos
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col h-full">
      <ProjectHeader
        project={project}
        onBack={handleBack}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onCreateTask={onCreateTask}
      />

      <div className="w-full bg-muted/20 dark:bg-background/50 flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Coluna principal: Tarefas */}
            <div className="xl:col-span-2">
              <ProjectTasksPanel projectId={projectId} onCreateTask={onCreateTask} />
            </div>

            {/* Coluna secundária: Resumo */}
            <div className="xl:col-span-1">
              <ProjectSummaryPanel
                project={project}
                tasks={tasks}
                totalHours={totalHours}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

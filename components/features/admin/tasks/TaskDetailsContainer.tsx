"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TaskListItem } from "./task.types"
import { TaskDetailsHeader } from "./TaskDetailsHeader"
import { TaskDetailsShell } from "./TaskDetailsShell"
import { taskEditSchema, TaskEditData } from "./task.edit.schema"
import { getTaskById } from "@/lib/api"
import { updateTask, deleteTask } from "@/lib/api/tasks"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TaskDetailsContainerProps {
  initialTask: TaskListItem
}

export function TaskDetailsContainer({ initialTask }: TaskDetailsContainerProps) {
  const router = useRouter()
  // Usar task do servidor diretamente (sem overrides locais)
  const [task, setTask] = useState<TaskListItem>(initialTask)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [draft, setDraft] = useState<Partial<TaskEditData>>(() => ({
    project: initialTask.project,
    team: initialTask.team,
    unit: initialTask.unit,
    status: initialTask.status,
    priority: initialTask.priority,
    assignees: initialTask.assignees,
    estimatedHours: initialTask.estimatedHours,
    acceptance: initialTask.acceptance || null,
  }))

  // Verifica se há alterações não salvas
  const hasUnsavedChanges = useMemo(() => {
    return (
      draft.project?.id !== task.project?.id ||
      draft.team?.id !== task.team?.id ||
      draft.unit !== task.unit ||
      draft.status !== task.status ||
      draft.priority !== task.priority ||
      draft.estimatedHours !== task.estimatedHours ||
      draft.acceptance !== (task.acceptance || null) ||
      JSON.stringify(draft.assignees?.map((a) => a.id).sort()) !==
      JSON.stringify(task.assignees.map((a) => a.id).sort())
    )
  }, [draft, task])

  const handleEdit = () => {
    // Resetar draft para o estado atual da task
    setDraft({
      project: task.project,
      team: task.team,
      unit: task.unit,
      status: task.status,
      priority: task.priority,
      assignees: task.assignees,
      estimatedHours: task.estimatedHours,
      acceptance: task.acceptance || null,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reverter draft para o estado atual da task
    setDraft({
      project: task.project,
      team: task.team,
      unit: task.unit,
      status: task.status,
      priority: task.priority,
      assignees: task.assignees,
      estimatedHours: task.estimatedHours,
      acceptance: task.acceptance || null,
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    // Validar draft
    const validation = taskEditSchema.safeParse(draft)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      toast.error(firstError?.message || "Dados inválidos")
      return
    }

    setIsSaving(true)

    try {
      const validatedData = validation.data

      // Preparar payload para API
      const updatePayload = {
        projectId: validatedData.project?.id || null,
        teamId: validatedData.team?.id || null,
        unit: validatedData.unit,
        status: validatedData.status,
        priority: validatedData.priority,
        assigneeIds: validatedData.assignees.map((a) => a.id),
        estimatedHours: validatedData.estimatedHours,
        acceptance: validatedData.acceptance ?? null,
      }

      // Corrigir: remover null para projectId e teamId, pois UpdateTaskRequest espera string | undefined, nunca null
      const fixedUpdatePayload = {
        ...updatePayload,
        projectId: updatePayload.projectId ?? undefined,
        teamId: updatePayload.teamId ?? undefined,
      };

      // Chamar API real
      const response = await updateTask(task.id, fixedUpdatePayload);

      // Atualizar estado com resposta do servidor
      setTask(response.task)
      setIsEditing(false)

      // Notificar que task foi atualizada (para recarregar atividade)
      // O TaskDetailsShell vai detectar a mudança em isEditing e recarregar

      toast.success("Tarefa atualizada com sucesso")
    } catch (error: any) {
      console.error("Erro ao salvar tarefa:", error)
      const errorMessage = error?.message || "Erro ao salvar tarefa"
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDraftChange = (updates: Partial<TaskEditData>) => {
    setDraft((prev) => ({ ...prev, ...updates }))
  }

  // Função para recarregar task do servidor (útil após mudanças em time entries)
  const reloadTask = async () => {
    try {
      const updatedTask = await getTaskById(task.id)
      setTask(updatedTask)
    } catch (error) {
      console.error("Erro ao recarregar tarefa:", error)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      toast.success("Tarefa excluída com sucesso")
      router.push("/admin/tarefas")
    } catch (error: any) {
      console.error("Erro ao excluir tarefa:", error)
      const errorMessage = error?.message || "Erro ao excluir tarefa"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Criar taskView (loggedHours já vem do servidor)
  const taskView = useMemo<TaskListItem>(() => {
    return task
  }, [task])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex flex-col h-full"
      >
        <TaskDetailsHeader
          task={taskView}
          isEditing={isEditing}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDeleteClick}
        />
        <TaskDetailsShell
          task={taskView}
          isEditing={isEditing}
          draft={draft}
          onDraftChange={handleDraftChange}
          onTaskReload={reloadTask}
        />
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa <strong>{task.title}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados (apontamentos, atividades, etc.) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

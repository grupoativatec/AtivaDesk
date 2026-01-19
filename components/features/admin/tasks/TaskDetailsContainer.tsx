"use client"

import { useState, useMemo } from "react"
import { TaskListItem } from "./task.types"
import { TaskDetailsHeader } from "./TaskDetailsHeader"
import { TaskDetailsShell } from "./TaskDetailsShell"
import { taskEditSchema, TaskEditData } from "./task.edit.schema"
import { getTaskById } from "@/lib/api"
import { updateTask } from "@/lib/api/tasks"
import { toast } from "sonner"

interface TaskDetailsContainerProps {
  initialTask: TaskListItem
}

export function TaskDetailsContainer({ initialTask }: TaskDetailsContainerProps) {
  // Usar task do servidor diretamente (sem overrides locais)
  const [task, setTask] = useState<TaskListItem>(initialTask)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState<Partial<TaskEditData>>(() => ({
    project: initialTask.project,
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
      draft.project?.id !== task.project.id ||
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
        projectId: validatedData.project.id,
        unit: validatedData.unit,
        status: validatedData.status,
        priority: validatedData.priority,
        assigneeIds: validatedData.assignees.map((a) => a.id),
        estimatedHours: validatedData.estimatedHours,
        acceptance: validatedData.acceptance ?? null,
      }

      // Chamar API real
      const response = await updateTask(task.id, updatePayload)

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

  // Criar taskView (loggedHours já vem do servidor)
  const taskView = useMemo<TaskListItem>(() => {
    return task
  }, [task])

  return (
    <div className="w-full flex flex-col h-full">
      <TaskDetailsHeader
        task={taskView}
        isEditing={isEditing}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
      />
      <TaskDetailsShell
        task={taskView}
        isEditing={isEditing}
        draft={draft}
        onDraftChange={handleDraftChange}
        onTaskReload={reloadTask}
      />
    </div>
  )
}

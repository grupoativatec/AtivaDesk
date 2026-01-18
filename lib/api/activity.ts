/**
 * API client para operações de atividade/auditoria de tarefas
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"
import { TaskActivityEvent } from "@/components/features/admin/tasks/activity/task-activity.types"

/**
 * Lista eventos de atividade de uma tarefa
 */
export async function listTaskActivity(taskId: string): Promise<TaskActivityEvent[]> {
  return api.get<TaskActivityEvent[]>(`/api/admin/tasks/${taskId}/activity`)
}

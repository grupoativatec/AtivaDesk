/**
 * API client para operações de apontamentos de horas
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"
import { TimeEntry, TimeEntryType } from "@/components/features/admin/tasks/time/time-entry.types"

/**
 * Dados para criação de apontamento
 */
export interface CreateTimeEntryRequest {
  date: string // YYYY-MM-DD
  hours: number
  type: TimeEntryType
  note?: string
}

/**
 * Resposta de criação de apontamento
 */
export interface CreateTimeEntryResponse {
  entry: TimeEntry
}

/**
 * Lista apontamentos de uma tarefa
 */
export async function listTimeEntries(taskId: string): Promise<TimeEntry[]> {
  return api.get<TimeEntry[]>(`/api/admin/tasks/${taskId}/time-entries`)
}

/**
 * Cria um novo apontamento
 */
export async function createTimeEntry(
  taskId: string,
  data: CreateTimeEntryRequest
): Promise<CreateTimeEntryResponse> {
  return api.post<CreateTimeEntryResponse>(
    `/api/admin/tasks/${taskId}/time-entries`,
    data
  )
}

/**
 * Remove um apontamento
 */
export async function deleteTimeEntry(
  taskId: string,
  entryId: string
): Promise<void> {
  return api.delete<void>(`/api/admin/tasks/${taskId}/time-entries/${entryId}`)
}

/**
 * Calcula o total de horas apontadas para uma tarefa
 */
export async function getTotalHours(taskId: string): Promise<number> {
  const response = await api.get<{ total: number }>(
    `/api/admin/tasks/${taskId}/time-entries/total`
  )
  return response.total
}

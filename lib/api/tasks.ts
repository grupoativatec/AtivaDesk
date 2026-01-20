/**
 * API client para operações de tarefas
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"
import { TaskListItem, TaskStatus, TaskPriority, TaskUnit, TaskFilters } from "@/components/features/admin/tasks/task.types"

/**
 * Resposta da listagem de tarefas
 */
export interface TasksListResponse {
  tasks: TaskListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Dados para atualização de tarefa
 */
export interface UpdateTaskRequest {
  projectId?: string
  unit?: TaskUnit
  status?: TaskStatus
  priority?: TaskPriority
  estimatedHours?: number
  assigneeIds?: string[]
  teamId?: string | null // Equipe responsável
  acceptance?: string | null
}

/**
 * Resposta de atualização de tarefa
 */
export interface UpdateTaskResponse {
  task: TaskListItem
}

/**
 * Lista tarefas com filtros e paginação
 */
export async function listTasks(filters?: TaskFilters): Promise<TasksListResponse> {
  const params = new URLSearchParams()

  if (filters?.q) params.append("q", filters.q)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.priority) params.append("priority", filters.priority)
  if (filters?.unit) params.append("unit", filters.unit)
  if (filters?.project) params.append("project", filters.project)
  if (filters?.page) params.append("page", filters.page.toString())
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString())

  const queryString = params.toString()
  const endpoint = `/api/admin/tasks${queryString ? `?${queryString}` : ""}`

  return api.get<TasksListResponse>(endpoint)
}

/**
 * Busca uma tarefa pelo ID
 */
export async function getTaskById(taskId: string): Promise<TaskListItem> {
  return api.get<TaskListItem>(`/api/admin/tasks/${taskId}`)
}

/**
 * Dados para criação de tarefa
 */
export interface CreateTaskRequest {
  title: string
  projectId?: string
  unit: TaskUnit
  priority: TaskPriority
  status?: TaskStatus
  assigneeIds?: string[]
  teamId?: string | null // Equipe responsável
  estimatedHours?: number
  description?: string
}

/**
 * Resposta de criação de tarefa
 */
export interface CreateTaskResponse {
  task: TaskListItem
}

/**
 * Cria uma nova tarefa
 */
export async function createTask(
  data: CreateTaskRequest
): Promise<CreateTaskResponse> {
  return api.post<CreateTaskResponse>("/api/admin/tasks", data)
}

/**
 * Atualiza uma tarefa
 */
export async function updateTask(
  taskId: string,
  data: UpdateTaskRequest
): Promise<UpdateTaskResponse> {
  return api.patch<UpdateTaskResponse>(`/api/admin/tasks/${taskId}`, data)
}

/**
 * Exclui uma tarefa
 */
export async function deleteTask(taskId: string): Promise<void> {
  return api.delete<void>(`/api/admin/tasks/${taskId}`)
}

/**
 * API client para operações de projetos
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"
import { ProjectListItem, ProjectFilters } from "@/components/features/projects/admin/project.types"

/**
 * Resposta da listagem de projetos
 */
export interface ProjectsListResponse {
  projects: ProjectListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Dados para criação de projeto
 */
export interface CreateProjectRequest {
  name: string
  code?: string
  unit?: "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"
  status?: "ACTIVE" | "ARCHIVED"
}

/**
 * Dados para atualização de projeto
 */
export interface UpdateProjectRequest {
  name?: string
  code?: string
  unit?: "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"
  status?: "ACTIVE" | "ARCHIVED"
}

/**
 * Resposta de criação/atualização de projeto
 */
export interface ProjectResponse {
  project: ProjectListItem
}

/**
 * Lista projetos com filtros e paginação
 */
export async function listProjects(filters?: ProjectFilters): Promise<ProjectsListResponse> {
  const params = new URLSearchParams()

  if (filters?.q) params.append("q", filters.q)
  if (filters?.status) params.append("status", filters.status)
  if (filters?.unit) params.append("unit", filters.unit)
  if (filters?.page) params.append("page", filters.page.toString())
  if (filters?.pageSize) params.append("pageSize", filters.pageSize.toString())

  const queryString = params.toString()
  const endpoint = `/api/admin/projects${queryString ? `?${queryString}` : ""}`

  return api.get<ProjectsListResponse>(endpoint)
}

/**
 * Busca um projeto pelo ID
 */
export async function getProjectById(projectId: string): Promise<ProjectListItem> {
  return api.get<ProjectListItem>(`/api/admin/projects/${projectId}`)
}

/**
 * Cria um novo projeto
 */
export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  return api.post<ProjectResponse>("/api/admin/projects", data)
}

/**
 * Atualiza um projeto
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectRequest
): Promise<ProjectResponse> {
  return api.patch<ProjectResponse>(`/api/admin/projects/${projectId}`, data)
}

/**
 * API client para operações de projetos
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"

/**
 * Projeto retornado pela API
 */
export interface Project {
  id: string
  name: string
  code?: string
  status: "ACTIVE" | "ARCHIVED"
  unit?: "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"
  createdAt: string
  updatedAt: string
}

/**
 * Lista todos os projetos ativos
 */
export async function listProjects(): Promise<Project[]> {
  return api.get<Project[]>("/api/admin/projects")
}

/**
 * Busca um projeto pelo ID
 */
export async function getProjectById(projectId: string): Promise<Project> {
  return api.get<Project>(`/api/admin/projects/${projectId}`)
}

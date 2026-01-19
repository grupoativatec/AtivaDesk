/**
 * API client para operações de usuários
 * Contratos tipados para comunicação com backend
 */

import { api } from "./client"

/**
 * Usuário retornado pela API
 */
export interface User {
  id: string
  name: string
  email: string
  role: "USER" | "AGENT" | "ADMIN"
}

/**
 * Resposta da listagem de usuários
 */
export interface UsersListResponse {
  ok: boolean
  users: User[]
}

/**
 * Lista usuários
 * @param role - Filtrar por role específico
 * @param all - Se true, retorna todos os usuários (USER, AGENT, ADMIN). Se false ou undefined, retorna apenas admins por padrão
 */
export async function listUsers(role?: "USER" | "AGENT" | "ADMIN", all?: boolean): Promise<User[]> {
  const params = new URLSearchParams()
  if (role) {
    params.append("role", role)
  }
  if (all) {
    params.append("all", "true")
  }

  const queryString = params.toString()
  const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ""}`

  const response = await api.get<UsersListResponse>(endpoint)
  return response.users
}

/**
 * Lista apenas administradores
 */
export async function listAdmins(): Promise<User[]> {
  return listUsers("ADMIN")
}

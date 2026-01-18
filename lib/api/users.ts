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
 * Lista usuários (por padrão apenas admins)
 */
export async function listUsers(role?: "USER" | "AGENT" | "ADMIN"): Promise<User[]> {
  const params = new URLSearchParams()
  if (role) {
    params.append("role", role)
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

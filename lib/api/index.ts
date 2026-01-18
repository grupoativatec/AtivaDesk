/**
 * API Client - Ponto de entrada centralizado
 * 
 * Regra: Nenhum componente deve chamar fetch diretamente.
 * Todos os componentes devem usar os módulos desta pasta.
 */

export { api, fetchJson, ApiClientError, type ApiError } from "./client"
export * from "./tasks"
export * from "./timeEntries"
export * from "./activity"
export * from "./projects"
export * from "./users"

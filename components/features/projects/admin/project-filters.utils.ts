import { ProjectStatus, TaskUnit } from "./project.types"

/**
 * Valida e parseia o valor de status da URL
 */
export function parseStatus(value: string | null): ProjectStatus | undefined {
  if (!value) return undefined
  const validStatuses: ProjectStatus[] = ["ACTIVE", "ARCHIVED"]
  return validStatuses.includes(value as ProjectStatus) ? (value as ProjectStatus) : undefined
}

/**
 * Valida e parseia o valor de unidade da URL
 */
export function parseUnit(value: string | null): TaskUnit | undefined {
  if (!value) return undefined
  const validUnits: TaskUnit[] = ["ITJ", "SFS", "FOZ", "DIO", "AOL"]
  return validUnits.includes(value as TaskUnit) ? (value as TaskUnit) : undefined
}

/**
 * Parseia um número da URL com valor padrão
 */
export function parseNumber(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) || parsed < 1 ? defaultValue : parsed
}


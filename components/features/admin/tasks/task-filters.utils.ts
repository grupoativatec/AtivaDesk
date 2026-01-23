import { TaskStatus, TaskPriority, TaskUnit } from "./task.types"

/**
 * Valida e parseia o valor de status da URL
 */
export function parseStatus(value: string | null): TaskStatus | undefined {
  if (!value) return undefined
  const validStatuses: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ]
  return validStatuses.includes(value as TaskStatus) ? (value as TaskStatus) : undefined
}

/**
 * Valida e parseia o valor de prioridade da URL
 */
export function parsePriority(value: string | null): TaskPriority | undefined {
  if (!value) return undefined
  const validPriorities: TaskPriority[] = [
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
    TaskPriority.URGENT,
  ]
  return validPriorities.includes(value as TaskPriority) ? (value as TaskPriority) : undefined
}

/**
 * Valida e parseia o valor de unidade da URL
 */
export function parseUnit(value: string | null): TaskUnit | undefined {
  if (!value) return undefined
  const validUnits: TaskUnit[] = [
    TaskUnit.ITJ,
    TaskUnit.SFS,
    TaskUnit.FOZ,
    TaskUnit.DIO,
    TaskUnit.AOL,
  ]
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

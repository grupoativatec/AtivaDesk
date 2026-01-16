import { TimeEntry } from "./time-entry.types"

/**
 * Calcula o total de horas a partir de uma lista de entries
 * Fonte única de verdade para cálculo de total
 */
export function getTotalHoursFromEntries(entries: TimeEntry[]): number {
  return entries.reduce((total, entry) => total + entry.hours, 0)
}

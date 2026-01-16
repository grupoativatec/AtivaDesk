/**
 * Tipos de apontamento de horas
 */
export type TimeEntryType = "DEV" | "TEST" | "MEETING" | "REWORK";

/**
 * Entrada de apontamento de horas
 */
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  date: string; // ISO date (YYYY-MM-DD)
  hours: number; // step 0.5
  type: TimeEntryType;
  note?: string;
  createdAt: string; // ISO datetime
}

/**
 * Labels em português para os tipos
 */
export const TIME_ENTRY_TYPE_LABELS: Record<TimeEntryType, string> = {
  DEV: "Desenvolvimento",
  TEST: "Teste",
  MEETING: "Reunião",
  REWORK: "Refatoração",
};

import type { TaskStatus } from "@/lib/generated/prisma/client"
import type { KanbanStatus } from "@/components/features/kanban/types/kanban.types"

/**
 * Mapeia o status de Task para KanbanStatus
 */
export function mapTaskStatusToKanbanStatus(taskStatus: TaskStatus): KanbanStatus {
  const mapping: Record<TaskStatus, KanbanStatus> = {
    BACKLOG: "TODO",
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    BLOCKED: "REVIEW", // Tarefas bloqueadas vão para REVIEW
    DONE: "DONE",
  }

  return mapping[taskStatus] || "TODO"
}

/**
 * Mapeia KanbanStatus para TaskStatus
 */
export function mapKanbanStatusToTaskStatus(kanbanStatus: KanbanStatus): TaskStatus {
  const mapping: Record<KanbanStatus, TaskStatus> = {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    REVIEW: "IN_PROGRESS", // REVIEW no Kanban mantém como IN_PROGRESS na Task (ou pode ser BLOCKED)
    DONE: "DONE",
  }

  return mapping[kanbanStatus] || "TODO"
}

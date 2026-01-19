export type KanbanStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"

export interface KanbanCard {
  id: string
  title: string
  description?: string
  status: KanbanStatus
  order: number
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string
  tags?: string[]
  projectId?: string
  projectName?: string
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: string
  status: KanbanStatus
  title: string
  order: number
  cardIds: string[]
}

export interface KanbanBoard {
  id: string
  name: string
  description?: string
  projectId?: string
  projectName?: string
  columns: KanbanColumn[]
  cards: Record<string, KanbanCard>
  createdAt: string
  updatedAt: string
}

export interface KanbanBoardListItem {
  id: string
  name: string
  description?: string
  projectId?: string
  projectName?: string
  cardCount: number
  updatedAt: string
  createdAt: string
}

export interface KanbanFilters {
  q?: string
  projectId?: string
  status?: KanbanStatus
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  onlyOverdue?: boolean
  assigneeId?: string
}

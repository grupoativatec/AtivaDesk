export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TaskUnit {
  ITJ = "ITJ",
  SFS = "SFS",
  FOZ = "FOZ",
  DIO = "DIO",
  AOL = "AOL",
}

export interface Project {
  id: string
  name: string
}

export interface Assignee {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
}

export interface TaskListItem {
  id: string
  title: string
  description?: string | null
  acceptance?: string | null
  project: Project | null
  team: Team | null
  unit: TaskUnit
  status: TaskStatus
  priority: TaskPriority
  assignees: Assignee[]
  estimatedHours: number
  loggedHours: number
  updatedAt: string // ISO date string
}

export interface TaskFilters {
  q?: string
  status?: TaskStatus
  priority?: TaskPriority
  unit?: TaskUnit
  project?: string
  page?: number
  pageSize?: number
}

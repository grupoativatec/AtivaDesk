export type ProjectStatus = "ACTIVE" | "ARCHIVED"

export type TaskUnit = "ITJ" | "SFS" | "FOZ" | "DIO" | "AOL"

export interface ProjectListItem {
  id: string
  name: string
  code?: string | null
  status: ProjectStatus
  unit?: TaskUnit | null
  updatedAt: string
  createdAt: string
  _count?: {
    tasks: number
  }
}

export interface ProjectFilters {
  q?: string
  status?: ProjectStatus
  unit?: TaskUnit
  page?: number
  pageSize?: number
}


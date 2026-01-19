"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { TaskStatus } from "@/components/features/admin/tasks/task.types"
import { cn } from "@/lib/utils"

type TaskFilterTab = "all" | "todo" | "in_progress" | "blocked" | "done"

interface ProjectTasksFiltersProps {
  activeTab: TaskFilterTab
  onTabChange: (tab: TaskFilterTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const TABS: Array<{ id: TaskFilterTab; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "todo", label: "A Fazer" },
  { id: "in_progress", label: "Em Progresso" },
  { id: "blocked", label: "Bloqueadas" },
  { id: "done", label: "Concluídas" },
]

export function ProjectTasksFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: ProjectTasksFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0",
              activeTab === tab.id && "font-semibold"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas por título..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>
    </div>
  )
}

export function getStatusFilterFromTab(tab: TaskFilterTab): TaskStatus[] | undefined {
  switch (tab) {
    case "todo":
      return [TaskStatus.BACKLOG, TaskStatus.TODO]
    case "in_progress":
      return [TaskStatus.IN_PROGRESS]
    case "blocked":
      return [TaskStatus.BLOCKED]
    case "done":
      return [TaskStatus.DONE]
    default:
      return undefined
  }
}


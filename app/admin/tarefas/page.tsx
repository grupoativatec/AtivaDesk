"use client"

import { useState } from "react"
import { TaskListShell } from "@/components/features/admin/tasks/TaskListShell"
import { CreateTaskModal } from "@/components/features/admin/tasks/CreateTaskModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AdminTasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header da página */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Tarefas
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gestão de demandas internas de TI por projeto, unidade e responsáveis
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="size-4 mr-2" />
                Nova tarefa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-auto">
        <TaskListShell />
      </div>

      {/* Modal de criação */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  )
}

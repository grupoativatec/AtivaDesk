"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TaskListShell } from "@/components/features/admin/tasks/TaskListShell"
import { CreateTaskModal } from "@/components/features/admin/tasks/CreateTaskModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AdminTasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col h-full"
    >
      {/* Header da página */}
      <div className="border-b border-border dark:border-border/30 bg-card dark:bg-card/30 shadow-sm dark:shadow-none shrink-0">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                Tarefas
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-1">
                Gestão de demandas internas de TI por projeto, unidade e responsáveis
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Plus className="size-3.5 sm:size-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nova tarefa</span>
                <span className="sm:hidden">Nova</span>
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
    </motion.div>
  )
}

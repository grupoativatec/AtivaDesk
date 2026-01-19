"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { KanbanStatus } from "../types/kanban.types"

interface AddCardInlineProps {
  boardId: string
  columnId: string
  columnStatus: KanbanStatus
  onShowTemplate: () => void
}

export function AddCardInline({
  boardId,
  columnId,
  columnStatus,
  onShowTemplate,
}: AddCardInlineProps) {
  return (
    <div className="p-2 border-t">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={onShowTemplate}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar card
      </Button>
    </div>
  )
}

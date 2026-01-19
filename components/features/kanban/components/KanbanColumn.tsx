"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"
import { KanbanColumn as KanbanColumnType } from "../types/kanban.types"
import { useKanbanStore } from "../store/useKanbanStore"
import { KanbanCardDragWrapper } from "./KanbanCardDragWrapper"
import { KanbanEmptyState } from "./KanbanEmptyState"
import { AddCardInline } from "./AddCardInline"
import { KanbanCardTemplate } from "./KanbanCardTemplate"
import { KanbanColumnMenu } from "./KanbanColumnMenu"
import { filterCards } from "../utils/kanban-filters.utils"
import { CARD_TYPE } from "../utils/dnd.handlers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface KanbanColumnProps {
  boardId: string
  column: KanbanColumnType
  onCreateCard?: () => void
  dragHandleProps?: {
    attributes: any
    listeners: any
  }
}

export function KanbanColumn({ boardId, column, onCreateCard, dragHandleProps }: KanbanColumnProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const filters = useKanbanStore((state) => state.filters)
  const [showTemplate, setShowTemplate] = useState(false)

  const allCards = column.cardIds
    .map((cardId) => board?.cards[cardId])
    .filter((card) => card !== undefined) as Array<NonNullable<typeof board.cards[string]>>

  // Aplica filtros
  const filteredCards = filterCards(allCards, filters)

  const hasFilters = Object.keys(filters).length > 0
  const showNoResults = hasFilters && filteredCards.length === 0 && allCards.length > 0

  // IDs dos cards filtrados para o SortableContext
  const filteredCardIds = filteredCards.map((card) => card.id)

  // Torna a coluna droppable para permitir drop em áreas vazias
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "COLUMN",
      columnId: column.id,
    },
  })

  return (
    <div className="shrink-0 w-full md:w-[280px] lg:w-80">
      <div
        ref={setDroppableRef}
        className={cn(
          "bg-card rounded-lg border h-full flex flex-col",
          isOver && "ring-2 ring-primary/50"
        )}
      >
        {/* Header da coluna */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{column.title}</h3>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {filteredCards.length}
              {hasFilters && filteredCards.length !== allCards.length && (
                <span className="text-muted-foreground/60">/{allCards.length}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Botão de drag da coluna */}
            {dragHandleProps && (
              <div
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
                style={{ touchAction: "none" }}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            )}
            <KanbanColumnMenu
              boardId={boardId}
              columnId={column.id}
              columnTitle={column.title}
            />
          </div>
        </div>

        {/* Cards com scroll vertical */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {showNoResults ? (
            <KanbanEmptyState
              type="no-results"
              onClearFilters={() => useKanbanStore.getState().setFilters({})}
            />
          ) : filteredCards.length === 0 && !showTemplate ? (
            <KanbanEmptyState
              type="no-cards"
              onCreateCard={onCreateCard}
            />
          ) : (
            <SortableContext
              id={column.id}
              items={filteredCardIds}
              strategy={verticalListSortingStrategy}
            >
              <div
                data-column-id={column.id}
                data-sortable-context
                className="space-y-3"
              >
                {filteredCards.map((card) => (
                  <KanbanCardDragWrapper
                    key={card.id}
                    boardId={boardId}
                    card={card}
                    columnId={column.id}
                  />
                ))}
                {/* Template aparece no final da lista quando está sendo criado */}
                {showTemplate && (
                  <KanbanCardTemplate
                    boardId={boardId}
                    columnId={column.id}
                    columnStatus={column.status}
                    onCancel={() => setShowTemplate(false)}
                  />
                )}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Add Card Inline */}
        {!showTemplate && (
          <AddCardInline
            boardId={boardId}
            columnId={column.id}
            columnStatus={column.status}
            onShowTemplate={() => setShowTemplate(true)}
          />
        )}
      </div>
    </div>
  )
}

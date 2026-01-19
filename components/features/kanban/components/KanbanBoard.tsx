"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { useKanbanStore } from "../store/useKanbanStore"
import { SortableColumn } from "./SortableColumn"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanEmptyState } from "./KanbanEmptyState"
import { KanbanDragOverlay } from "./KanbanDragOverlay"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  handleDragStart as handleDragStartUtil,
  handleDragOver as handleDragOverUtil,
  handleDragEnd as handleDragEndUtil,
  getDragData,
  CARD_TYPE,
  COLUMN_TYPE,
} from "../utils/dnd.handlers"

interface KanbanBoardProps {
  boardId: string
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useKanbanStore((state) => state.boards[boardId])
  const moveCard = useKanbanStore((state) => state.moveCard)
  const reorderColumns = useKanbanStore((state) => state.reorderColumns)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  if (!board) {
    return null
  }

  const sortedColumns = [...board.columns].sort((a, b) => a.order - b.order)

  if (sortedColumns.length === 0) {
    return (
      <div className="h-full p-6">
        <KanbanEmptyState type="no-columns" />
      </div>
    )
  }

  // No mobile, usa a primeira coluna como padrão
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(
    isMobile && sortedColumns.length > 0 ? sortedColumns[0].id : null
  )

  const activeCard = activeCardId ? board.cards[activeCardId] : null
  const selectedColumn = selectedColumnId
    ? sortedColumns.find((col) => col.id === selectedColumnId)
    : null

  const onDragStart = (event: DragStartEvent) => {
    const data = getDragData(event.active)
    if (data) {
      if (data.type === CARD_TYPE && data.cardId) {
        setActiveCardId(data.cardId)
      } else if (data.type === COLUMN_TYPE) {
        setActiveColumnId(data.columnId)
      }
    }
    handleDragStartUtil(event)
  }

  const onDragOver = (event: DragOverEvent) => {
    handleDragOverUtil(event)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const activeData = getDragData(active)

    // Atualiza o board antes de chamar o handler (para ter dados atualizados)
    const currentBoard = useKanbanStore.getState().boards[boardId]
    if (!currentBoard) {
      setActiveCardId(null)
      setActiveColumnId(null)
      return
    }

    // Se está arrastando uma coluna
    if (activeData?.type === COLUMN_TYPE && over) {
      const overData = over.data.current as any

      // Se soltou sobre outra coluna ou área válida
      if (overData?.type === COLUMN_TYPE || currentBoard.columns.find((col) => col.id === over.id)) {
        const activeColId = activeData.columnId
        const overColId = overData?.columnId || (over.id as string)

        if (activeColId !== overColId) {
          const activeIndex = currentBoard.columns.findIndex((col) => col.id === activeColId)
          const overIndex = currentBoard.columns.findIndex((col) => col.id === overColId)

          if (activeIndex !== -1 && overIndex !== -1) {
            // Cria uma cópia ordenada das colunas
            const newColumns = [...currentBoard.columns]
            const [removed] = newColumns.splice(activeIndex, 1)
            newColumns.splice(overIndex, 0, removed)

            // Garante que apenas IDs válidos do board atual sejam enviados
            const newColumnIds = newColumns
              .map((col) => col.id)
              .filter((id) => currentBoard.columns.some((col) => col.id === id))

            // Só chama se todos os IDs forem válidos e a quantidade for a mesma
            if (newColumnIds.length === currentBoard.columns.length) {
              reorderColumns(boardId, newColumnIds).catch((error) => {
                console.error("Erro ao reordenar colunas:", error)
              })
            } else {
              console.warn("Tentativa de reordenar com IDs inválidos. Ignorando.")
            }
          }
        }
      }
    }
    // Se está arrastando um card
    else if (activeData?.type === CARD_TYPE) {
      handleDragEndUtil(event, currentBoard, handleMoveCard)
    }

    setActiveCardId(null)
    setActiveColumnId(null)
  }

  // Wrapper para moveCard que remove o boardId
  const handleMoveCard = async (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newIndex: number
  ) => {
    try {
      await moveCard(boardId, cardId, sourceColumnId, destinationColumnId, newIndex)
    } catch (error) {
      // Erro já foi tratado no store (rollback automático)
      // Em produção, pode mostrar uma notificação de erro aqui
      console.error("Erro ao mover card:", error)
    }
  }

  // Visualização mobile: uma coluna por vez com seletor
  if (isMobile) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="h-full flex flex-col">
          {/* Seletor de coluna no mobile */}
          <div className="p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shrink-0">
            <Select
              value={selectedColumnId || ""}
              onValueChange={(value) => {
                if (value) {
                  setSelectedColumnId(value)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma coluna" />
              </SelectTrigger>
              <SelectContent>
                {sortedColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title} ({column.cardIds.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coluna selecionada */}
          <div className="flex-1 overflow-hidden min-h-0">
            {selectedColumn ? (
              <div className="h-full p-4">
                <KanbanColumn
                  key={selectedColumn.id}
                  boardId={boardId}
                  column={selectedColumn}
                />
              </div>
            ) : (
              <div className="h-full p-6">
                <KanbanEmptyState type="no-columns" />
              </div>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <KanbanDragOverlay card={activeCard} boardId={boardId} />
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    )
  }

  // Visualização desktop: todas as colunas lado a lado
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="h-full p-3 sm:p-6">
          <SortableContext
            items={sortedColumns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 sm:gap-4 h-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {sortedColumns.map((column) => (
                <SortableColumn
                  key={column.id}
                  boardId={boardId}
                  column={column}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanDragOverlay card={activeCard} boardId={boardId} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}

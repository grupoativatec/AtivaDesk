import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  Active,
  Over,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { KanbanBoard } from "../types/kanban.types"

export const CARD_TYPE = "CARD"
export const COLUMN_TYPE = "COLUMN"

export interface DragData {
  type: typeof CARD_TYPE | typeof COLUMN_TYPE
  cardId?: string
  columnId: string
  boardId: string
}

export function getDragData(active: Active): DragData | null {
  const data = active.data.current
  if (!data) return null
  return data as DragData
}

export function handleDragStart(
  event: DragStartEvent,
  onDragStart?: (cardId: string, columnId: string) => void
) {
  const data = getDragData(event.active)
  if (data && data.type === CARD_TYPE && data.cardId && onDragStart) {
    onDragStart(data.cardId, data.columnId)
  }
}

export function handleDragOver(event: DragOverEvent) {
  // Pode ser usado para lógica adicional durante o drag
  // Por enquanto, apenas retorna
}

export function handleDragEnd(
  event: DragEndEvent,
  board: KanbanBoard,
  onMoveCard: (
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newIndex: number
  ) => void
) {
  const { active, over } = event
  const activeData = getDragData(active)

  if (!activeData || !over || activeData.type !== CARD_TYPE || !activeData.cardId) {
    return
  }

  const { cardId, columnId: sourceColumnId } = activeData

  // Verifica se o destino é válido
  const overData = over.data.current as DragData | { type?: string; columnId?: string } | null
  const overId = over.id as string

  let destinationColumnId: string
  let newIndex: number

  // Estratégia 1: Se o destino é outro card, pega a coluna dele
  if (overData?.type === CARD_TYPE && overData.columnId) {
    destinationColumnId = overData.columnId
    const destColumn = board.columns.find((col) => col.id === destinationColumnId)
    if (!destColumn) return

    const overCardIndex = destColumn.cardIds.indexOf(overId)
    
    if (overCardIndex >= 0) {
      // Dropping sobre um card específico - insere antes dele
      newIndex = overCardIndex
    } else {
      // Card não encontrado, adiciona no final
      newIndex = destColumn.cardIds.length
    }
  }
  // Estratégia 2: Se o destino é uma coluna (useDroppable)
  else if (overData?.type === "COLUMN" && overData.columnId) {
    destinationColumnId = overData.columnId
    const destColumn = board.columns.find((col) => col.id === destinationColumnId)
    if (!destColumn) return
    newIndex = destColumn.cardIds.length
  }
  // Estratégia 3: Verifica se over.id é uma coluna (pode ser do SortableContext ou useDroppable)
  else {
    const destColumn = board.columns.find((col) => col.id === overId)
    if (destColumn) {
      destinationColumnId = destColumn.id
      newIndex = destColumn.cardIds.length
    } else {
      // Não encontrou destino válido
      return
    }
  }

  // Se está na mesma coluna, calcula o novo índice considerando o arrayMove
  if (sourceColumnId === destinationColumnId) {
    const sourceColumn = board.columns.find((col) => col.id === sourceColumnId)
    if (!sourceColumn) return

    const oldIndex = sourceColumn.cardIds.indexOf(cardId)
    if (oldIndex === -1) return

    // Se está na mesma posição, não faz nada
    if (oldIndex === newIndex) {
      return
    }

    // Ajusta o índice se está movendo para baixo na mesma coluna
    if (newIndex > oldIndex) {
      newIndex = newIndex - 1
    }
  }

  // Move o card
  onMoveCard(cardId, sourceColumnId, destinationColumnId, newIndex)
}

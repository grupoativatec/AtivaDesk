"use client"

import { create } from "zustand"
import { KanbanBoard, KanbanCard, KanbanColumn, KanbanStatus, KanbanFilters } from "../types/kanban.types"
import {
  persistMoveCard,
  persistUpdateCard,
  persistCreateCard,
  persistDeleteCard,
  persistCreateColumn,
  persistUpdateColumn,
  persistDeleteColumn,
  persistReorderColumns,
  type MoveCardPayload,
  type UpdateCardPayload,
  type CreateCardPayload,
  type DeleteCardPayload,
  type CreateColumnPayload,
  type UpdateColumnPayload,
  type DeleteColumnPayload,
  type ReorderColumnsPayload,
} from "../services/kanban.service"

interface KanbanStore {
  boards: Record<string, KanbanBoard>
  currentBoardId: string | null
  filters: KanbanFilters
  
  // Actions
  setCurrentBoard: (boardId: string | null) => void
  setBoard: (board: KanbanBoard) => void
  setFilters: (filters: KanbanFilters) => void
  addCard: (boardId: string, card: KanbanCard, columnId: string) => Promise<void>
  updateCard: (boardId: string, cardId: string, updates: Partial<KanbanCard>) => Promise<void>
  moveCard: (
    boardId: string,
    cardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newIndex: number
  ) => Promise<void>
  deleteCard: (boardId: string, cardId: string) => Promise<void>
  addColumn: (boardId: string, column: KanbanColumn) => Promise<void>
  updateColumn: (boardId: string, columnId: string, updates: Partial<KanbanColumn>) => Promise<void>
  deleteColumn: (boardId: string, columnId: string) => Promise<void>
  reorderColumns: (boardId: string, columnIds: string[]) => Promise<void>
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  boards: {},
  currentBoardId: null,
  filters: {},

  setCurrentBoard: (boardId) => set({ currentBoardId: boardId }),

  setFilters: (filters) => set({ filters }),

  setBoard: (board) =>
    set((state) => ({
      boards: {
        ...state.boards,
        [board.id]: board,
      },
    })),

  addCard: async (boardId, card, columnId) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      const column = board.columns.find((col) => col.id === columnId)
      if (!column) return state

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            cards: {
              ...board.cards,
              [card.id]: card,
            },
            columns: board.columns.map((col) =>
              col.id === columnId
                ? { ...col, cardIds: [...col.cardIds, card.id] }
                : col
            ),
          },
        },
      }
    })

    // Chama serviço
    try {
      const { id, createdAt, updatedAt, ...cardWithoutMeta } = card
      const payload: CreateCardPayload = {
        boardId,
        columnId,
        card: cardWithoutMeta,
      }
      
      await persistCreateCard(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao criar card:", error)
      throw error
    }
  },

  updateCard: async (boardId, cardId, updates) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    const previousCard = previousBoard?.cards[cardId]
    
    if (!previousBoard || !previousCard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board || !board.cards[cardId]) return state

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            cards: {
              ...board.cards,
              [cardId]: {
                ...board.cards[cardId],
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: UpdateCardPayload = {
        boardId,
        cardId,
        updates,
      }
      
      await persistUpdateCard(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao atualizar card:", error)
      throw error
    }
  },

  moveCard: async (boardId, cardId, sourceColumnId, destinationColumnId, newIndex) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      const sourceColumn = board.columns.find((col) => col.id === sourceColumnId)
      const destColumn = board.columns.find((col) => col.id === destinationColumnId)

      if (!sourceColumn || !destColumn) return state

      // Remove da coluna origem
      const newSourceCardIds = sourceColumn.cardIds.filter((id) => id !== cardId)

      // Adiciona na coluna destino na posição correta
      const newDestCardIds = [...destColumn.cardIds]
      newDestCardIds.splice(newIndex, 0, cardId)

      // Atualiza o status do card se mudou de coluna
      const card = board.cards[cardId]
      const newStatus = destColumn.status
      const updatedCard = card
        ? { ...card, status: newStatus, updatedAt: new Date().toISOString() }
        : null

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            cards: updatedCard
              ? {
                  ...board.cards,
                  [cardId]: updatedCard,
                }
              : board.cards,
            columns: board.columns.map((col) => {
              if (col.id === sourceColumnId) {
                return { ...col, cardIds: newSourceCardIds }
              }
              if (col.id === destinationColumnId) {
                return { ...col, cardIds: newDestCardIds }
              }
              return col
            }),
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: MoveCardPayload = {
        boardId,
        cardId,
        sourceColumnId,
        destinationColumnId,
        newIndex,
      }
      
      await persistMoveCard(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao mover card:", error)
      throw error
    }
  },

  deleteCard: async (boardId, cardId) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      const { [cardId]: removed, ...remainingCards } = board.cards

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            cards: remainingCards,
            columns: board.columns.map((col) => ({
              ...col,
              cardIds: col.cardIds.filter((id) => id !== cardId),
            })),
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: DeleteCardPayload = {
        boardId,
        cardId,
      }
      
      await persistDeleteCard(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao deletar card:", error)
      throw error
    }
  },

  addColumn: async (boardId, column) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: [...board.columns, column],
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })

    // Chama serviço
    try {
      const { cardIds, ...columnWithoutCardIds } = column
      const payload: CreateColumnPayload = {
        boardId,
        column: columnWithoutCardIds,
      }
      
      await persistCreateColumn(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao criar coluna:", error)
      throw error
    }
  },

  updateColumn: async (boardId, columnId, updates) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: board.columns.map((col) =>
              col.id === columnId ? { ...col, ...updates } : col
            ),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: UpdateColumnPayload = {
        boardId,
        columnId,
        updates,
      }
      
      await persistUpdateColumn(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao atualizar coluna:", error)
      throw error
    }
  },

  deleteColumn: async (boardId, columnId) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      const column = board.columns.find((col) => col.id === columnId)
      if (!column) return state

      // Remove todos os cards da coluna
      const cardIdsToRemove = column.cardIds
      const { ...remainingCards } = board.cards
      cardIdsToRemove.forEach((cardId) => {
        delete remainingCards[cardId]
      })

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            cards: remainingCards,
            columns: board.columns.filter((col) => col.id !== columnId),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: DeleteColumnPayload = {
        boardId,
        columnId,
      }
      
      await persistDeleteColumn(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao deletar coluna:", error)
      throw error
    }
  },

  reorderColumns: async (boardId, columnIds) => {
    // Salva estado anterior para rollback
    const previousState = useKanbanStore.getState()
    const previousBoard = previousState.boards[boardId]
    
    if (!previousBoard) return

    // Valida que todos os IDs pertencem ao board atual
    const validColumnIds = columnIds.filter((id) =>
      previousBoard.columns.some((col) => col.id === id)
    )

    // Se a quantidade de IDs válidos for diferente, há um problema
    if (validColumnIds.length !== columnIds.length || validColumnIds.length !== previousBoard.columns.length) {
      console.warn(
        `Tentativa de reordenar com IDs inválidos. Esperado: ${previousBoard.columns.length}, Recebido: ${columnIds.length}, Válidos: ${validColumnIds.length}`
      )
      // Retorna sem fazer nada se houver IDs inválidos
      return
    }

    // Aplica mudança otimisticamente
    set((state) => {
      const board = state.boards[boardId]
      if (!board) return state

      // Reordena as colunas baseado no array de IDs
      const reorderedColumns = validColumnIds
        .map((columnId) => board.columns.find((col) => col.id === columnId))
        .filter((col): col is KanbanColumn => col !== undefined)
        .map((col, index) => ({ ...col, order: index }))

      // Mantém colunas que não estão no array (caso de erro)
      const remainingColumns = board.columns.filter(
        (col) => !validColumnIds.includes(col.id)
      )

      return {
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: [...reorderedColumns, ...remainingColumns].sort(
              (a, b) => a.order - b.order
            ),
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })

    // Chama serviço
    try {
      const payload: ReorderColumnsPayload = {
        boardId,
        columnIds: validColumnIds, // Usa apenas IDs válidos
      }
      
      await persistReorderColumns(payload)
      // Se sucesso, mantém o estado otimista
    } catch (error) {
      // Rollback em caso de erro
      set((state) => ({
        boards: {
          ...state.boards,
          [boardId]: previousBoard,
        },
      }))
      
      // Log do erro (em produção, usar sistema de notificações)
      console.error("Erro ao reordenar colunas:", error)
      throw error
    }
  },
}))

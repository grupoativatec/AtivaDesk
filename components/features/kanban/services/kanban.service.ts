import type { KanbanBoard, KanbanCard, KanbanColumn } from "../types/kanban.types"
import { api } from "@/lib/api/client"

/**
 * Serviço de API para Kanban
 * 
 * Todas as funções fazem chamadas HTTP reais para as rotas de API.
 */

interface ApiResponse<T> {
  ok: boolean
  [key: string]: any
}

/**
 * Lista todos os boards que o usuário pode acessar
 */
export async function fetchBoards(): Promise<KanbanBoard[]> {
  const response = await api.get<ApiResponse<{ boards: KanbanBoard[] }>>(
    `/api/kanban/boards`
  )
  
  if (!response.ok || !response.boards) {
    throw new Error("Erro ao buscar boards")
  }
  
  return response.boards
}

/**
 * Busca um board completo pelo ID
 */
export async function fetchBoard(boardId: string): Promise<KanbanBoard> {
  const response = await api.get<ApiResponse<{ board: KanbanBoard }>>(
    `/api/kanban/boards/${boardId}`
  )
  
  if (!response.ok || !response.board) {
    throw new Error("Board não encontrado")
  }
  
  return response.board
}

/**
 * Payload para mover um card
 */
export interface MoveCardPayload {
  boardId: string
  cardId: string
  sourceColumnId: string
  destinationColumnId: string
  newIndex: number
}

/**
 * Persiste o movimento de um card no backend
 */
export async function persistMoveCard(payload: MoveCardPayload): Promise<void> {
  await api.patch<ApiResponse<void>>(
    `/api/kanban/cards/${payload.cardId}/move`,
    {
      sourceColumnId: payload.sourceColumnId,
      destinationColumnId: payload.destinationColumnId,
      newIndex: payload.newIndex,
    }
  )
}

/**
 * Payload para atualizar um card
 */
export interface UpdateCardPayload {
  boardId: string
  cardId: string
  updates: Partial<KanbanCard>
}

/**
 * Persiste a atualização de um card no backend
 */
export async function persistUpdateCard(payload: UpdateCardPayload): Promise<KanbanCard> {
  const response = await api.patch<ApiResponse<{ card: KanbanCard }>>(
    `/api/kanban/cards/${payload.cardId}`,
    payload.updates
  )
  
  if (!response.ok || !response.card) {
    throw new Error("Erro ao atualizar card")
  }
  
  return response.card
}

/**
 * Payload para criar um card
 */
export interface CreateCardPayload {
  boardId: string
  columnId: string
  card: Omit<KanbanCard, "id" | "createdAt" | "updatedAt">
}

/**
 * Persiste a criação de um card no backend
 */
export async function persistCreateCard(payload: CreateCardPayload): Promise<KanbanCard> {
  const response = await api.post<ApiResponse<{ card: KanbanCard }>>(
    `/api/kanban/boards/${payload.boardId}/cards`,
    {
      columnId: payload.columnId,
      title: payload.card.title,
      description: payload.card.description,
      priority: payload.card.priority,
      dueDate: payload.card.dueDate,
      tags: payload.card.tags,
      assigneeId: payload.card.assigneeId,
    }
  )
  
  if (!response.ok || !response.card) {
    throw new Error("Erro ao criar card")
  }
  
  return response.card
}

/**
 * Payload para deletar um card
 */
export interface DeleteCardPayload {
  boardId: string
  cardId: string
}

/**
 * Persiste a exclusão de um card no backend
 */
export async function persistDeleteCard(payload: DeleteCardPayload): Promise<void> {
  await api.delete<ApiResponse<void>>(
    `/api/kanban/cards/${payload.cardId}`
  )
}

/**
 * Payload para criar uma coluna
 */
export interface CreateColumnPayload {
  boardId: string
  column: Omit<KanbanColumn, "cardIds">
}

/**
 * Persiste a criação de uma coluna no backend
 * Nota: Esta rota ainda não existe na API, mantendo stub por enquanto
 */
export async function persistCreateColumn(payload: CreateColumnPayload): Promise<KanbanColumn> {
  // TODO: Implementar rota POST /api/kanban/boards/:boardId/columns
  // Por enquanto, retorna a coluna como se tivesse sido criada
  // (a criação já é feita no store otimisticamente)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const newColumn: KanbanColumn = {
        ...payload.column,
        cardIds: [], // Sempre começa vazia
      }
      
      resolve(newColumn)
    }, 300)
  })
}

/**
 * Payload para atualizar uma coluna
 */
export interface UpdateColumnPayload {
  boardId: string
  columnId: string
  updates: Partial<KanbanColumn>
}

/**
 * Persiste a atualização de uma coluna no backend
 */
export async function persistUpdateColumn(payload: UpdateColumnPayload): Promise<KanbanColumn> {
  // Se for atualização de título, usa a rota específica
  if (payload.updates.title !== undefined) {
    const response = await api.patch<ApiResponse<{ column: any }>>(
      `/api/kanban/boards/${payload.boardId}/columns/${payload.columnId}`,
      { title: payload.updates.title }
    )
    
    if (!response.ok || !response.column) {
      throw new Error("Erro ao atualizar coluna")
    }
    
    // Retorna no formato esperado
    return {
      id: response.column.id,
      status: response.column.status,
      title: response.column.title,
      order: response.column.order,
      cardIds: [], // Será preenchido pelo board completo
    }
  }
  
  // Para outras atualizações, retorna como está (por enquanto)
  return {
    id: payload.columnId,
    status: "TODO",
    title: "",
    order: 0,
    cardIds: [],
    ...payload.updates,
  } as KanbanColumn
}

/**
 * Payload para deletar uma coluna
 */
export interface DeleteColumnPayload {
  boardId: string
  columnId: string
}

/**
 * Persiste a exclusão de uma coluna no backend
 */
export async function persistDeleteColumn(payload: DeleteColumnPayload): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/api/kanban/boards/${payload.boardId}/columns/${payload.columnId}`
  )
  
  if (!response.ok) {
    throw new Error(response.error || "Erro ao deletar coluna")
  }
}

/**
 * Payload para reordenar colunas
 */
export interface ReorderColumnsPayload {
  boardId: string
  columnIds: string[] // Array de IDs na nova ordem
}

/**
 * Persiste a reordenação de colunas no backend
 */
export async function persistReorderColumns(payload: ReorderColumnsPayload): Promise<void> {
  const response = await api.patch<ApiResponse<void>>(
    `/api/kanban/boards/${payload.boardId}/columns/reorder`,
    { columnIds: payload.columnIds }
  )
  
  if (!response.ok) {
    throw new Error(response.error || "Erro ao reordenar colunas")
  }
}

/**
 * Payload para atualizar um board
 */
export interface UpdateBoardPayload {
  boardId: string
  updates: {
    name?: string
    description?: string
  }
}

/**
 * Persiste a atualização de um board no backend
 */
export async function persistUpdateBoard(payload: UpdateBoardPayload): Promise<KanbanBoard> {
  const response = await api.patch<ApiResponse<{ board: KanbanBoard }>>(
    `/api/kanban/boards/${payload.boardId}`,
    payload.updates
  )
  
  if (!response.ok || !response.board) {
    throw new Error(response.error || "Erro ao atualizar board")
  }
  
  return response.board
}

/**
 * Payload para deletar um board
 */
export interface DeleteBoardPayload {
  boardId: string
}

/**
 * Persiste a exclusão de um board no backend
 */
export async function persistDeleteBoard(payload: DeleteBoardPayload): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(
    `/api/kanban/boards/${payload.boardId}`
  )
  
  if (!response.ok) {
    throw new Error(response.error || "Erro ao deletar board")
  }
}

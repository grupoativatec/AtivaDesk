import type { KanbanBoard, KanbanCard } from "@/components/features/kanban/types/kanban.types"
import type {
  KanbanBoard as PrismaKanbanBoard,
  KanbanColumn as PrismaKanbanColumn,
  KanbanCard as PrismaKanbanCard,
} from "@/lib/generated/prisma/client"

/**
 * Transforma um board do Prisma para o formato do frontend
 */
export function transformBoard(
  board: PrismaKanbanBoard & {
    columns: (PrismaKanbanColumn & {
      cards: PrismaKanbanCard[]
    })[]
    cards: PrismaKanbanCard[]
    project?: {
      id: string
      name: string
    } | null
  }
): KanbanBoard {
  // Agrupa cards por ID para o formato Record<string, KanbanCard>
  const cardsRecord: Record<string, KanbanCard> = {}
  
  board.cards.forEach((card) => {
    cardsRecord[card.id] = transformCard(card as any)
  })

  // Transforma colunas e mapeia cardIds
  const columns = board.columns
    .map((column) => {
      // Ordena cards por order
      const columnCards = column.cards.sort((a, b) => a.order - b.order)
      
      return {
        id: column.id,
        status: column.status as KanbanBoard["columns"][0]["status"],
        title: column.title,
        order: column.order,
        cardIds: columnCards.map((card) => card.id),
      }
    })
    .sort((a, b) => a.order - b.order)

  return {
    id: board.id,
    name: board.name,
    description: board.description || undefined,
    projectId: board.projectId || undefined,
    projectName: board.project?.name || undefined,
    columns,
    cards: cardsRecord,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  }
}

/**
 * Transforma um card do Prisma para o formato do frontend
 */
export function transformCard(
  card: PrismaKanbanCard & {
    assignee?: {
      id: string
      name: string
      email: string
      avatar?: string | null
    } | null
    column: {
      status: string
    }
    board: {
      projectId?: string | null
      project?: {
        id: string
        name: string
      } | null
    }
  }
): KanbanCard {
  return {
    id: card.id,
    title: card.title,
    description: card.description || undefined,
    status: card.column.status as KanbanCard["status"],
    order: card.order,
    priority: card.priority || undefined,
    dueDate: card.dueDate?.toISOString() || undefined,
    tags: card.tags || undefined,
    assigneeId: card.assigneeId || undefined,
    assigneeName: card.assignee?.name || undefined,
    assigneeAvatar: card.assignee?.avatar || undefined,
    projectId: card.board.projectId || undefined,
    projectName: card.board.project?.name || undefined,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }
}

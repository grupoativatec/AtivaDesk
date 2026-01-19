import { KanbanBoard, KanbanBoardListItem, KanbanCard, KanbanStatus } from "../types/kanban.types"

const STATUS_CONFIG: Record<KanbanStatus, { title: string; order: number }> = {
  TODO: { title: "A Fazer", order: 0 },
  IN_PROGRESS: { title: "Em Progresso", order: 1 },
  REVIEW: { title: "Em Revisão", order: 2 },
  DONE: { title: "Concluído", order: 3 },
}

export function createMockBoard(
  id: string,
  name: string,
  projectId?: string,
  projectName?: string
): KanbanBoard {
  const columns = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    id: `col-${id}-${status}`,
    status: status as KanbanStatus,
    title: config.title,
    order: config.order,
    cardIds: [] as string[],
  }))

  const cards: Record<string, KanbanCard> = {}

  // Adiciona alguns cards de exemplo
  const cardTitles = [
    "Implementar autenticação",
    "Criar componente de sidebar",
    "Adicionar testes unitários",
    "Refatorar código legado",
    "Otimizar performance",
    "Documentar API",
    "Corrigir bugs críticos",
    "Implementar dark mode",
  ]

  cardTitles.forEach((title, index) => {
    const statuses: KanbanStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"]
    const status = statuses[index % statuses.length]
    const column = columns.find((col) => col.status === status)!

    const cardId = `card-${id}-${index}`
    const card: KanbanCard = {
      id: cardId,
      title,
      description: `Descrição da tarefa: ${title}`,
      status,
      order: column.cardIds.length,
      assigneeId: index % 2 === 0 ? "user-1" : undefined,
      assigneeName: index % 2 === 0 ? "João Silva" : undefined,
      assigneeAvatar: index % 2 === 0 ? undefined : undefined,
      priority: index % 3 === 0 ? "HIGH" : index % 3 === 1 ? "MEDIUM" : "LOW",
      dueDate:
        index % 2 === 0
          ? new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      tags: index % 2 === 0 ? ["urgente", "frontend"] : ["backend"],
      projectId,
      projectName,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - index * 12 * 60 * 60 * 1000).toISOString(),
    }

    cards[cardId] = card
    column.cardIds.push(cardId)
  })

  return {
    id,
    name,
    description: `Board de exemplo: ${name}`,
    projectId,
    projectName,
    columns,
    cards,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const mockBoards: KanbanBoard[] = [
  createMockBoard("board-1", "Sprint 1 - Desenvolvimento", "project-1", "Projeto Principal"),
  createMockBoard("board-2", "Sprint 2 - QA", "project-1", "Projeto Principal"),
  createMockBoard("board-3", "Backlog Geral"),
]

export const mockBoardListItems: KanbanBoardListItem[] = mockBoards.map((board) => ({
  id: board.id,
  name: board.name,
  description: board.description,
  projectId: board.projectId,
  projectName: board.projectName,
  cardCount: Object.keys(board.cards).length,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
}))

export function getMockBoardById(id: string): KanbanBoard | undefined {
  return mockBoards.find((board) => board.id === id)
}

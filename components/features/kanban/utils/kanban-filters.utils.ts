import { KanbanCard, KanbanFilters } from "../types/kanban.types"

export function filterCards(
  cards: KanbanCard[],
  filters: KanbanFilters
): KanbanCard[] {
  return cards.filter((card) => {
    // Busca por texto (title, description, tags)
    if (filters.q) {
      const query = filters.q.toLowerCase()
      const matchesTitle = card.title.toLowerCase().includes(query)
      const matchesDescription = card.description?.toLowerCase().includes(query) ?? false
      const matchesTags = card.tags?.some((tag) => tag.toLowerCase().includes(query)) ?? false

      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false
      }
    }

    // Filtro por prioridade
    if (filters.priority && card.priority !== filters.priority) {
      return false
    }

    // Filtro por status
    if (filters.status && card.status !== filters.status) {
      return false
    }

    // Filtro por projeto
    if (filters.projectId && card.projectId !== filters.projectId) {
      return false
    }

    // Filtro por atrasadas (dueDate < hoje)
    if (filters.onlyOverdue) {
      if (!card.dueDate) {
        return false
      }
      const dueDate = new Date(card.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dueDate >= today) {
        return false
      }
    }

    return true
  })
}

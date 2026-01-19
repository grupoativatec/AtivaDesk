import { prisma } from "@/lib/prisma"
import type { User } from "@/lib/generated/prisma/client"

export enum KanbanPermission {
  VIEWER = "VIEWER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN",
}

/**
 * Verifica se o usuário tem acesso ao board (é criador ou membro)
 */
export async function canAccessBoard(
  userId: string,
  boardId: string
): Promise<boolean> {
  const board = await prisma.kanbanBoard.findFirst({
    where: {
      id: boardId,
      OR: [
        { createdById: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  })

  return !!board
}

/**
 * Retorna a permissão do usuário no board
 */
export async function getUserBoardPermission(
  userId: string,
  boardId: string
): Promise<KanbanPermission | null> {
  const board = await prisma.kanbanBoard.findUnique({
    where: { id: boardId },
    include: {
      members: {
        where: { userId },
      },
    },
  })

  if (!board) {
    return null
  }

  // Criador sempre é ADMIN
  if (board.createdById === userId) {
    return KanbanPermission.ADMIN
  }

  // Verifica se é membro
  const member = board.members[0]
  if (member) {
    return member.role as KanbanPermission
  }

  return null
}

/**
 * Verifica se o usuário pode editar o board (EDITOR ou ADMIN)
 */
export async function canEditBoard(
  userId: string,
  boardId: string
): Promise<boolean> {
  const permission = await getUserBoardPermission(userId, boardId)
  return (
    permission === KanbanPermission.EDITOR ||
    permission === KanbanPermission.ADMIN
  )
}

/**
 * Verifica se o usuário é admin do board (ADMIN ou criador)
 */
export async function isBoardAdmin(
  userId: string,
  boardId: string
): Promise<boolean> {
  const permission = await getUserBoardPermission(userId, boardId)
  return permission === KanbanPermission.ADMIN
}

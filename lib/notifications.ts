import { prisma } from "./prisma";

/**
 * Extrai apenas o primeiro nome de um nome completo
 * Remove sufixos como " - Grupo Ativa" e retorna apenas o primeiro nome
 */
function getFirstName(fullName: string): string {
  // Remover qualquer coisa após " - " (hífen com espaços)
  const nameWithoutSuffix = fullName.split(" - ")[0].trim();

  // Pegar apenas o primeiro nome
  return nameWithoutSuffix.split(" ")[0] || fullName;
}

/**
 * Extrai os 5 primeiros caracteres do ID do ticket
 */
function getTicketIdShort(ticketId: string): string {
  return ticketId.substring(0, 5).toUpperCase();
}

type NotificationType =
  | "NEW_TICKET"
  | "NEW_MESSAGE"
  | "TICKET_ASSIGNED"
  | "TICKET_STATUS_CHANGED"
  | "TICKET_PRIORITY_CHANGED";

interface CreateNotificationParams {
  type: NotificationType;
  ticketId?: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  userIds?: string[]; // Se não fornecido, notifica todos os admins
}

/**
 * Cria notificações para usuários
 * Se userIds não for fornecido, notifica todos os administradores
 */
export async function createNotifications({
  type,
  ticketId,
  title,
  message,
  metadata,
  userIds,
}: CreateNotificationParams) {
  try {
    // Se userIds não foi fornecido, buscar todos os admins
    let targetUserIds = userIds;

    if (!targetUserIds || targetUserIds.length === 0) {
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },
        select: {
          id: true,
        },
      });
      targetUserIds = admins.map((admin) => admin.id);
    }

    // Se não há usuários para notificar, retornar
    if (!targetUserIds || targetUserIds.length === 0) {
      return [];
    }

    // Criar notificações em lote
    const notifications = await prisma.notification.createMany({
      data: targetUserIds.map((userId) => {
        const notificationData: any = {
          userId,
          ticketId: ticketId || null,
          type,
          title,
          message,
          status: "UNREAD",
        };

        if (metadata) {
          notificationData.metadata = metadata;
        }

        return notificationData;
      }),
    });

    return notifications;
  } catch (error) {
    console.error("Erro ao criar notificações:", error);
    // Não lançar erro para não quebrar o fluxo principal
    return [];
  }
}

/**
 * Cria notificação de novo ticket
 */
export async function notifyNewTicket(
  ticketId: string,
  ticketTitle: string,
  openedByName: string
) {
  const firstName = getFirstName(openedByName);
  const ticketIdShort = getTicketIdShort(ticketId);
  return createNotifications({
    type: "NEW_TICKET",
    ticketId,
    title: `Novo Chamado Criado (${ticketIdShort})`,
    message: `${firstName} abriu um novo chamado: ${ticketTitle}`,
    metadata: {
      ticketTitle,
      openedByName,
    },
  });
}

/**
 * Cria notificação de nova mensagem
 * Notifica todos os admins exceto o autor (se for admin)
 */
export async function notifyNewMessage(
  ticketId: string,
  ticketTitle: string,
  authorId: string,
  authorName: string,
  isAuthorAdmin: boolean
) {
  // Se o autor é admin, buscar todos os admins exceto ele
  let excludeUserIds: string[] = [];
  if (isAuthorAdmin) {
    excludeUserIds = [authorId];
  }

  // Buscar todos os admins
  const allAdmins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  // Filtrar o autor se for admin
  const targetUserIds = allAdmins
    .map((admin) => admin.id)
    .filter((id) => !excludeUserIds.includes(id));

  const firstName = getFirstName(authorName);
  const ticketIdShort = getTicketIdShort(ticketId);
  return createNotifications({
    type: "NEW_MESSAGE",
    ticketId,
    title: `Nova Mensagem no Chamado (${ticketIdShort})`,
    message: `${firstName} enviou uma nova mensagem no chamado: ${ticketTitle}`,
    metadata: {
      ticketTitle,
      authorName,
      authorId,
    },
    userIds: targetUserIds,
  });
}

/**
 * Cria notificação de ticket atribuído
 */
export async function notifyTicketAssigned(
  ticketId: string,
  ticketTitle: string,
  assigneeId: string
) {
  const ticketIdShort = getTicketIdShort(ticketId);
  return createNotifications({
    type: "TICKET_ASSIGNED",
    ticketId,
    title: `Chamado Atribuído (${ticketIdShort})`,
    message: `O chamado "${ticketTitle}" foi atribuído a você`,
    metadata: {
      ticketTitle,
    },
    userIds: [assigneeId],
  });
}

/**
 * Cria notificação de mudança de status
 */
export async function notifyStatusChanged(
  ticketId: string,
  ticketTitle: string,
  oldStatus: string,
  newStatus: string
) {
  const ticketIdShort = getTicketIdShort(ticketId);
  return createNotifications({
    type: "TICKET_STATUS_CHANGED",
    ticketId,
    title: `Status do Chamado Alterado (${ticketIdShort})`,
    message: `O status do chamado "${ticketTitle}" mudou de ${oldStatus} para ${newStatus}`,
    metadata: {
      ticketTitle,
      oldStatus,
      newStatus,
    },
  });
}

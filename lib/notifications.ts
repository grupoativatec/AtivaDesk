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

/**
 * Extrai os 5 primeiros caracteres do ID da tarefa
 */
function getTaskIdShort(taskId: string): string {
  return taskId.substring(0, 5).toUpperCase();
}

/**
 * Extrai os 5 primeiros caracteres do ID do projeto
 */
function getProjectIdShort(projectId: string): string {
  return projectId.substring(0, 5).toUpperCase();
}

type NotificationType =
  | "NEW_TICKET"
  | "NEW_MESSAGE"
  | "TICKET_ASSIGNED"
  | "TICKET_STATUS_CHANGED"
  | "TICKET_PRIORITY_CHANGED"
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_UPDATED"
  | "TASK_ASSIGNED"
  | "PROJECT_CREATED"
  | "PROJECT_TASK_ADDED"
  | "PROJECT_UPDATED";

interface CreateNotificationParams {
  type: NotificationType;
  ticketId?: string;
  taskId?: string;
  projectId?: string;
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
  taskId,
  projectId,
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
          taskId: taskId || null,
          projectId: projectId || null,
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

// ========== NOTIFICAÇÕES DE TAREFAS ==========

/**
 * Cria notificação quando uma nova tarefa é criada
 * Sempre notifica o criador da tarefa (confirmação)
 */
export async function notifyTaskCreated(
  taskId: string,
  taskTitle: string,
  projectId: string,
  projectName: string,
  creatorId: string,
  creatorName: string,
  projectCreatorId?: string | null
) {
  const taskIdShort = getTaskIdShort(taskId);
  const firstName = getFirstName(creatorName);
  
  // Sempre notificar o criador da tarefa
  return createNotifications({
    type: "TASK_CREATED",
    taskId,
    projectId,
    title: `Nova Tarefa Criada (${taskIdShort})`,
    message: `Você criou a tarefa "${taskTitle}" no projeto ${projectName}`,
    metadata: {
      taskTitle,
      projectName,
      creatorName,
      creatorId,
    },
    userIds: [creatorId],
  });
}

/**
 * Cria notificação quando o status de uma tarefa muda
 * Notifica o criador da tarefa e o criador do projeto
 */
export async function notifyTaskStatusChanged(
  taskId: string,
  taskTitle: string,
  projectId: string,
  projectName: string,
  oldStatus: string,
  newStatus: string,
  taskCreatorId?: string | null,
  projectCreatorId?: string | null,
  actorId?: string
) {
  const taskIdShort = getTaskIdShort(taskId);
  
  const userIds: string[] = [];
  // Notificar criador da tarefa (se diferente do ator)
  if (taskCreatorId && taskCreatorId !== actorId) {
    userIds.push(taskCreatorId);
  }
  // Notificar criador do projeto (se diferente do ator e do criador da tarefa)
  if (projectCreatorId && projectCreatorId !== actorId && projectCreatorId !== taskCreatorId) {
    userIds.push(projectCreatorId);
  }

  return createNotifications({
    type: "TASK_STATUS_CHANGED",
    taskId,
    projectId,
    title: `Status da Tarefa Alterado (${taskIdShort})`,
    message: `O status da tarefa "${taskTitle}" no projeto ${projectName} mudou de ${oldStatus} para ${newStatus}`,
    metadata: {
      taskTitle,
      projectName,
      oldStatus,
      newStatus,
    },
    userIds: userIds.length > 0 ? userIds : undefined,
  });
}

/**
 * Cria notificação quando uma tarefa é atualizada
 * Notifica o criador da tarefa e o criador do projeto
 */
export async function notifyTaskUpdated(
  taskId: string,
  taskTitle: string,
  projectId: string,
  projectName: string,
  taskCreatorId?: string | null,
  projectCreatorId?: string | null,
  actorId?: string
) {
  const taskIdShort = getTaskIdShort(taskId);
  
  const userIds: string[] = [];
  // Notificar criador da tarefa (se diferente do ator)
  if (taskCreatorId && taskCreatorId !== actorId) {
    userIds.push(taskCreatorId);
  }
  // Notificar criador do projeto (se diferente do ator e do criador da tarefa)
  if (projectCreatorId && projectCreatorId !== actorId && projectCreatorId !== taskCreatorId) {
    userIds.push(projectCreatorId);
  }

  return createNotifications({
    type: "TASK_UPDATED",
    taskId,
    projectId,
    title: `Tarefa Atualizada (${taskIdShort})`,
    message: `A tarefa "${taskTitle}" no projeto ${projectName} foi atualizada`,
    metadata: {
      taskTitle,
      projectName,
    },
    userIds: userIds.length > 0 ? userIds : undefined,
  });
}

/**
 * Cria notificação quando uma tarefa é atribuída a alguém
 */
export async function notifyTaskAssigned(
  taskId: string,
  taskTitle: string,
  projectId: string,
  projectName: string,
  assigneeId: string
) {
  const taskIdShort = getTaskIdShort(taskId);
  return createNotifications({
    type: "TASK_ASSIGNED",
    taskId,
    projectId,
    title: `Tarefa Atribuída (${taskIdShort})`,
    message: `A tarefa "${taskTitle}" no projeto ${projectName} foi atribuída a você`,
    metadata: {
      taskTitle,
      projectName,
    },
    userIds: [assigneeId],
  });
}

// ========== NOTIFICAÇÕES DE PROJETOS ==========

/**
 * Cria notificação quando um novo projeto é criado
 * Notifica o criador (confirmação)
 */
export async function notifyProjectCreated(
  projectId: string,
  projectName: string,
  creatorId: string
) {
  const projectIdShort = getProjectIdShort(projectId);
  return createNotifications({
    type: "PROJECT_CREATED",
    projectId,
    title: `Projeto Criado (${projectIdShort})`,
    message: `O projeto "${projectName}" foi criado com sucesso`,
    metadata: {
      projectName,
    },
    userIds: [creatorId],
  });
}

/**
 * Cria notificação quando uma nova tarefa é adicionada ao projeto
 * Notifica o criador do projeto
 */
export async function notifyProjectTaskAdded(
  projectId: string,
  projectName: string,
  taskId: string,
  taskTitle: string,
  projectCreatorId?: string | null,
  taskCreatorId?: string | null
) {
  const projectIdShort = getProjectIdShort(projectId);
  const taskIdShort = getTaskIdShort(taskId);
  
  // Notificar apenas o criador do projeto (se diferente do criador da tarefa)
  const userIds: string[] = [];
  if (projectCreatorId && projectCreatorId !== taskCreatorId) {
    userIds.push(projectCreatorId);
  }

  return createNotifications({
    type: "PROJECT_TASK_ADDED",
    projectId,
    taskId,
    title: `Nova Tarefa no Projeto (${projectIdShort})`,
    message: `Uma nova tarefa "${taskTitle}" foi adicionada ao projeto ${projectName}`,
    metadata: {
      projectName,
      taskTitle,
      taskId,
    },
    userIds: userIds.length > 0 ? userIds : undefined,
  });
}

/**
 * Cria notificação quando um projeto é atualizado
 * Notifica o criador do projeto
 */
export async function notifyProjectUpdated(
  projectId: string,
  projectName: string,
  projectCreatorId?: string | null,
  actorId?: string
) {
  const projectIdShort = getProjectIdShort(projectId);
  
  // Notificar apenas o criador do projeto (se diferente do ator)
  const userIds: string[] = [];
  if (projectCreatorId && projectCreatorId !== actorId) {
    userIds.push(projectCreatorId);
  }

  return createNotifications({
    type: "PROJECT_UPDATED",
    projectId,
    title: `Projeto Atualizado (${projectIdShort})`,
    message: `O projeto "${projectName}" foi atualizado`,
    metadata: {
      projectName,
    },
    userIds: userIds.length > 0 ? userIds : undefined,
  });
}

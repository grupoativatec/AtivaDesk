import {
  TaskStatus,
  TaskPriority,
  TaskUnit,
  Project,
  Assignee,
} from "../task.types";
import { statusLabelMap } from "../TaskStatusBadge";
import { priorityLabelMap } from "../TaskPriorityBadge";
import { TimeEntry, TIME_ENTRY_TYPE_LABELS } from "../time/time-entry.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const UNIT_LABELS: Record<TaskUnit, string> = {
  ITJ: "ITJ",
  SFS: "SFS",
  FOZ: "FOZ",
  DIO: "DIO",
  AOL: "AOL",
};

interface TaskUpdateDiff {
  field: string;
  from: string;
  to: string;
}

/**
 * Formata mensagem para atualização de tarefa
 */
export function formatTaskUpdatedMessage(
  changes: TaskUpdateDiff[],
  project?: Project,
  assignees?: Assignee[]
): string {
  if (changes.length === 0) {
    return "Atualizou a tarefa.";
  }

  const changeParts: string[] = [];

  changes.forEach((change) => {
    changeParts.push(`${change.field} (${change.from} → ${change.to})`);
  });

  const changesText = changeParts.join(", ");

  // Adicionar contexto adicional apenas se o campo não estiver no diff
  const contextParts: string[] = [];
  const hasProjectChange = changes.some((c) => c.field === "Projeto");
  const hasAssigneesChange = changes.some((c) => c.field === "Responsáveis");

  if (project && !hasProjectChange) {
    contextParts.push(`Projeto: ${project.name}`);
  }
  if (assignees && assignees.length > 0 && !hasAssigneesChange) {
    const names = assignees.map((a) => a.name.split(" ")[0]).join(", ");
    contextParts.push(`Responsáveis: ${names}`);
  }

  let message = `Atualizou a tarefa: ${changesText}.`;
  if (contextParts.length > 0) {
    message += ` ${contextParts.join(", ")}.`;
  }

  return message;
}

/**
 * Formata mensagem para apontamento adicionado
 */
export function formatTimeEntryAddedMessage(entry: TimeEntry): string {
  const dateFormatted = format(new Date(entry.date), "dd/MM/yyyy", {
    locale: ptBR,
  });
  const typeLabel = TIME_ENTRY_TYPE_LABELS[entry.type];
  return `Registrou apontamento: ${entry.hours}h em ${typeLabel} (${dateFormatted}).`;
}

/**
 * Formata mensagem para apontamento removido
 */
export function formatTimeEntryDeletedMessage(entry: TimeEntry): string {
  const dateFormatted = format(new Date(entry.date), "dd/MM/yyyy", {
    locale: ptBR,
  });
  const typeLabel = TIME_ENTRY_TYPE_LABELS[entry.type];
  return `Removeu apontamento: ${entry.hours}h em ${typeLabel} (${dateFormatted}).`;
}

/**
 * Helper para criar diff de atualização de tarefa
 */
export function createTaskUpdateDiff(
  oldTask: {
    project: Project;
    unit: TaskUnit;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedHours: number;
    assignees: Assignee[];
  },
  newTask: {
    project: Project;
    unit: TaskUnit;
    status: TaskStatus;
    priority: TaskPriority;
    estimatedHours: number;
    assignees: Assignee[];
  }
): TaskUpdateDiff[] {
  const changes: TaskUpdateDiff[] = [];

  if (oldTask.project.id !== newTask.project.id) {
    changes.push({
      field: "Projeto",
      from: oldTask.project.name,
      to: newTask.project.name,
    });
  }

  if (oldTask.unit !== newTask.unit) {
    changes.push({
      field: "Unidade",
      from: UNIT_LABELS[oldTask.unit],
      to: UNIT_LABELS[newTask.unit],
    });
  }

  if (oldTask.status !== newTask.status) {
    changes.push({
      field: "Status",
      from: statusLabelMap[oldTask.status],
      to: statusLabelMap[newTask.status],
    });
  }

  if (oldTask.priority !== newTask.priority) {
    changes.push({
      field: "Prioridade",
      from: priorityLabelMap[oldTask.priority],
      to: priorityLabelMap[newTask.priority],
    });
  }

  if (oldTask.estimatedHours !== newTask.estimatedHours) {
    changes.push({
      field: "Horas estimadas",
      from: `${oldTask.estimatedHours}h`,
      to: `${newTask.estimatedHours}h`,
    });
  }

  const oldAssigneeIds = oldTask.assignees.map((a) => a.id).sort();
  const newAssigneeIds = newTask.assignees.map((a) => a.id).sort();
  if (JSON.stringify(oldAssigneeIds) !== JSON.stringify(newAssigneeIds)) {
    const oldNames =
      oldTask.assignees.map((a) => a.name.split(" ")[0]).join(", ") || "Nenhum";
    const newNames =
      newTask.assignees.map((a) => a.name.split(" ")[0]).join(", ") || "Nenhum";
    changes.push({
      field: "Responsáveis",
      from: oldNames,
      to: newNames,
    });
  }

  return changes;
}

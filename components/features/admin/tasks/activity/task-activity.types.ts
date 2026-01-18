export type TaskActivityType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_ASSIGNEES_CHANGED"
  | "TIME_ENTRY_ADDED"
  | "TIME_ENTRY_DELETED";

export interface TaskActor {
  id: string;
  name: string;
}

export interface TaskActivityEvent {
  id: string;
  taskId: string;
  type: TaskActivityType;
  actor: TaskActor;
  createdAt: string; // ISO datetime
  message: string; // String pronta para UI
  meta?: Record<string, any>; // Opcional, para futuro
}

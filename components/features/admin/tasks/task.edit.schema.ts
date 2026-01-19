import { z } from "zod"
import { TaskStatus, TaskPriority, TaskUnit } from "./task.types"

/**
 * Schema de validação para edição de tarefa
 */
export const taskEditSchema = z.object({
  project: z.object({
    id: z.string().min(1, "Projeto é obrigatório"),
    name: z.string().min(1),
  }),
  unit: z.nativeEnum(TaskUnit, {
    required_error: "Unidade é obrigatória",
  }),
  status: z.nativeEnum(TaskStatus, {
    required_error: "Status é obrigatório",
  }),
  priority: z.nativeEnum(TaskPriority, {
    required_error: "Prioridade é obrigatória",
  }),
  assignees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  estimatedHours: z
    .number()
    .int("Horas devem ser um número inteiro")
    .min(0, "Horas não podem ser negativas")
    .max(500, "Horas estimadas não podem exceder 500"),
  acceptance: z.string().optional().nullable(),
})

export type TaskEditData = z.infer<typeof taskEditSchema>

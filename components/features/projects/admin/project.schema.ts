import { z } from "zod"
import { ProjectStatus, TaskUnit } from "./project.types"

export const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z
    .string()
    .min(2, "Código deve ter pelo menos 2 caracteres")
    .max(20, "Código deve ter no máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  unit: z.enum(["ITJ", "SFS", "FOZ", "DIO", "AOL"]).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  name: z.string().min(1, "Nome é obrigatório").optional(),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>


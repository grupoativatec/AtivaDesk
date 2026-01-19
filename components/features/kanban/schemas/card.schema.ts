import { z } from "zod"

export const createCardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  assigneeName: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateCardFormData = z.infer<typeof createCardSchema>

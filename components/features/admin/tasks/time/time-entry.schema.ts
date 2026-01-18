import { z } from "zod";
import { TimeEntryType } from "./time-entry.types";

/**
 * Schema de validação para criação de apontamento de horas
 */
export const timeEntrySchema = z.object({
  date: z
    .string()
    .min(1, "Data é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  hours: z
    .number()
    .positive("Horas devem ser maiores que zero")
    .max(12, "Máximo de 12 horas por apontamento")
    .refine((val) => val % 0.5 === 0, "Horas devem ser múltiplos de 0.5"),
  type: z.enum(["DEV", "TEST", "MEETING", "REWORK"]),
  note: z
    .string()
    .max(500, "Observação deve ter no máximo 500 caracteres")
    .optional(),
  userId: z.string().min(1, "Usuário é obrigatório"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
});

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

import { z } from 'zod'

export const backlogBookSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  author: z.string().min(1, 'Autor:in ist erforderlich').max(200),
  coverUrl: z
    .string()
    .url('Ungültige URL – bitte vollständige URL mit https:// eingeben')
    .optional()
    .or(z.literal(''))
    .default(''),
  description: z.string().max(1000).optional().default(''),
  reason: z.string().max(500).optional().default(''),
})

export type BacklogBookFormData = z.infer<typeof backlogBookSchema>

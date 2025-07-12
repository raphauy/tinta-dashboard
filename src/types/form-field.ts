import { z } from "zod"

/**
 * Schema para validación de campos de formulario
 * Usado tanto en plantillas como en formularios
 */
export const formFieldSchema = z.object({
  id: z.string().min(1, "ID de campo requerido"),
  type: z.enum(['text', 'textarea'], {
    errorMap: () => ({ message: "Tipo de campo inválido" })
  }),
  label: z.string().min(1, "Etiqueta requerida"),
  helpText: z.string().optional(),
  required: z.boolean(),
  order: z.number().int().min(0, "Orden debe ser positivo"),
  allowAttachments: z.boolean().optional().default(false), // NUEVO: Permite adjuntar archivos
  properties: z.record(z.any()).optional()
})

/**
 * Tipo derivado del schema para campos de formulario
 */
export type FormField = z.infer<typeof formFieldSchema>

/**
 * Tipos disponibles para campos de formulario
 */
export const FIELD_TYPES = ['text', 'textarea'] as const
export type FieldType = typeof FIELD_TYPES[number]

/**
 * Configuración de tipos de campo con sus etiquetas
 */
export const FIELD_TYPE_CONFIG = {
  text: { 
    label: 'Texto corto',
    description: 'Campo de texto de una línea'
  },
  textarea: { 
    label: 'Texto largo',
    description: 'Campo de texto de múltiples líneas'
  }
} as const
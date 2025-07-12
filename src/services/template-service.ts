import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type FormTemplate, type User } from "@prisma/client"
import { formFieldSchema } from "@/types/form-field"

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(255, "Nombre muy largo"),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  fields: z.array(formFieldSchema).min(1, "Al menos un campo requerido"),
  createdById: z.string().min(1, "ID de creador requerido")
})

export const updateTemplateSchema = createTemplateSchema.partial().omit({ createdById: true })

// Tipos derivados de schemas
export type CreateTemplateData = z.infer<typeof createTemplateSchema>
export type UpdateTemplateData = z.infer<typeof updateTemplateSchema>

// Tipos extendidos para queries
export type TemplateWithCreator = FormTemplate & {
  createdBy: Pick<User, 'id' | 'name' | 'email'>
}

export type TemplateWithStats = TemplateWithCreator & {
  _count: {
    forms: number
  }
}

/**
 * Crea una nueva plantilla de formulario
 */
export async function createTemplate(data: CreateTemplateData): Promise<TemplateWithCreator> {
  const validated = createTemplateSchema.parse(data)
  
  return await prisma.formTemplate.create({
    data: {
      name: validated.name,
      description: validated.description,
      fields: validated.fields,
      createdById: validated.createdById
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

/**
 * Obtiene todas las plantillas con estadísticas
 */
export async function getTemplates(): Promise<TemplateWithStats[]> {
  return await prisma.formTemplate.findMany({
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { forms: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Obtiene una plantilla por ID
 */
export async function getTemplateById(id: string): Promise<TemplateWithCreator | null> {
  return await prisma.formTemplate.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

/**
 * Actualiza una plantilla existente
 */
export async function updateTemplate(
  id: string, 
  data: UpdateTemplateData
): Promise<TemplateWithCreator> {
  const validated = updateTemplateSchema.parse(data)
  
  return await prisma.formTemplate.update({
    where: { id },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.description !== undefined && { description: validated.description }),
      ...(validated.fields && { fields: validated.fields })
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

/**
 * Elimina una plantilla si no está en uso
 */
export async function deleteTemplate(id: string): Promise<void> {
  // Verificar que no hay formularios usando esta plantilla
  const formsCount = await prisma.form.count({
    where: { templateId: id }
  })
  
  if (formsCount > 0) {
    throw new Error(`No se puede eliminar plantilla en uso por ${formsCount} formulario(s)`)
  }
  
  await prisma.formTemplate.delete({
    where: { id }
  })
}

/**
 * Verifica si una plantilla existe
 */
export async function templateExists(id: string): Promise<boolean> {
  const count = await prisma.formTemplate.count({
    where: { id }
  })
  
  return count > 0
}

/**
 * Obtiene plantillas creadas por un usuario específico
 */
export async function getTemplatesByCreator(createdById: string): Promise<TemplateWithStats[]> {
  return await prisma.formTemplate.findMany({
    where: { createdById },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { forms: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Busca plantillas por nombre (para admin dashboard)
 */
export async function searchTemplates(query: string): Promise<TemplateWithStats[]> {
  return await prisma.formTemplate.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { forms: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type Form, type FormTemplate, type User, type Workspace } from "@prisma/client"
import crypto from "crypto"
import { formFieldSchema } from "@/types/form-field"

// ✅ Generación de tokens seguros
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ✅ Validaciones al inicio del archivo
export const createFormSchema = z.object({
  title: z.string().min(1, "Título requerido").max(255, "Título muy largo"),
  title2: z.string().max(255, "Segunda línea del título muy larga").optional(),
  color: z.string().optional(), // Color del círculo (hex o nombre de color de marca)
  subtitle: z.string().max(1000, "Subtítulo muy largo").optional(),
  projectName: z.string().max(255, "Nombre de proyecto muy largo").optional(),
  client: z.string().max(255, "Nombre de cliente muy largo").optional(),
  workspaceId: z.string().min(1, "ID de workspace requerido"),
  templateId: z.string().optional(),
  fields: z.array(formFieldSchema).min(1, "Al menos un campo requerido"),
  allowEdits: z.boolean().default(false),
  shareToken: z.string().min(1, "Token de compartir requerido"),
  createdById: z.string().min(1, "ID de creador requerido")
})

export const updateFormSchema = createFormSchema.partial().omit({ 
  workspaceId: true, 
  shareToken: true, 
  createdById: true 
}).extend({
  isActive: z.boolean().optional()
})

// Tipos derivados de schemas
export type CreateFormData = z.infer<typeof createFormSchema>
export type UpdateFormData = z.infer<typeof updateFormSchema>

// Tipos extendidos para queries
export type FormWithRelations = Form & {
  workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
  template?: Pick<FormTemplate, 'id' | 'name'> | null
  createdBy: Pick<User, 'id' | 'name' | 'email'>
  _count: {
    responses: number
  }
}

export type FormWithWorkspaceUsers = Form & {
  workspace: Workspace & {
    users: Array<{
      user: Pick<User, 'id' | 'name' | 'email'>
    }>
  }
  _count: {
    responses: number
  }
}

/**
 * Crea un nuevo formulario
 */
export async function createForm(data: CreateFormData): Promise<FormWithRelations> {
  const validated = createFormSchema.parse(data)
  
  return await prisma.form.create({
    data: {
      title: validated.title,
      title2: validated.title2,
      color: validated.color,
      subtitle: validated.subtitle,
      projectName: validated.projectName,
      client: validated.client,
      workspaceId: validated.workspaceId,
      templateId: validated.templateId,
      fields: validated.fields,
      allowEdits: validated.allowEdits,
      shareToken: validated.shareToken,
      createdById: validated.createdById
    },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    }
  })
}

/**
 * Obtiene formularios por workspace
 */
export async function getFormsByWorkspace(workspaceId: string): Promise<FormWithRelations[]> {
  return await prisma.form.findMany({
    where: { workspaceId },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Obtiene un formulario por ID
 */
export async function getFormById(id: string): Promise<FormWithRelations | null> {
  return await prisma.form.findUnique({
    where: { id },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    }
  })
}

/**
 * Obtiene un formulario por token público (para formularios públicos)
 */
export async function getFormByToken(token: string): Promise<FormWithWorkspaceUsers | null> {
  return await prisma.form.findUnique({
    where: { shareToken: token },
    include: {
      workspace: {
        include: {
          users: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      },
      _count: {
        select: { responses: true }
      }
    }
  })
}

/**
 * Actualiza un formulario existente
 */
export async function updateForm(
  id: string, 
  data: UpdateFormData
): Promise<FormWithRelations> {
  const validated = updateFormSchema.parse(data)
  
  return await prisma.form.update({
    where: { id },
    data: {
      ...(validated.title && { title: validated.title }),
      ...(validated.title2 !== undefined && { title2: validated.title2 }),
      ...(validated.color !== undefined && { color: validated.color }),
      ...(validated.subtitle !== undefined && { subtitle: validated.subtitle }),
      ...(validated.projectName !== undefined && { projectName: validated.projectName }),
      ...(validated.client !== undefined && { client: validated.client }),
      ...(validated.templateId !== undefined && { templateId: validated.templateId }),
      ...(validated.fields && { fields: validated.fields }),
      ...(validated.allowEdits !== undefined && { allowEdits: validated.allowEdits }),
      ...(validated.isActive !== undefined && { isActive: validated.isActive })
    },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    }
  })
}

/**
 * Actualiza el estado activo/inactivo de un formulario
 */
export async function updateFormStatus(id: string, isActive: boolean): Promise<FormWithRelations> {
  return await prisma.form.update({
    where: { id },
    data: { isActive },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    }
  })
}

/**
 * Regenera el token de compartir de un formulario
 */
export async function regenerateShareToken(id: string): Promise<string> {
  const newToken = generateShareToken()
  
  await prisma.form.update({
    where: { id },
    data: { shareToken: newToken }
  })
  
  return newToken
}

/**
 * Elimina un formulario si no tiene respuestas
 */
export async function deleteForm(id: string): Promise<void> {
  // Verificar que no hay respuestas
  const responsesCount = await prisma.formResponse.count({
    where: { formId: id }
  })
  
  if (responsesCount > 0) {
    throw new Error(`No se puede eliminar formulario con ${responsesCount} respuesta(s)`)
  }
  
  await prisma.form.delete({
    where: { id }
  })
}

/**
 * Verifica si un formulario existe y está activo
 */
export async function isFormActiveByToken(token: string): Promise<boolean> {
  const count = await prisma.form.count({
    where: { 
      shareToken: token,
      isActive: true
    }
  })
  
  return count > 0
}

/**
 * Obtiene formularios creados por un usuario específico
 */
export async function getFormsByCreator(createdById: string): Promise<FormWithRelations[]> {
  return await prisma.form.findMany({
    where: { createdById },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Busca formularios por nombre (para workspace dashboard)
 */
export async function searchFormsInWorkspace(
  workspaceId: string, 
  query: string
): Promise<FormWithRelations[]> {
  return await prisma.form.findMany({
    where: {
      workspaceId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { subtitle: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Obtiene estadísticas globales de formularios (para admin dashboard)
 */
export async function getFormsStats() {
  const [total, active, withResponses] = await Promise.all([
    prisma.form.count(),
    prisma.form.count({ where: { isActive: true } }),
    prisma.form.count({ 
      where: { 
        responses: { 
          some: {} 
        } 
      } 
    })
  ])
  
  return {
    total,
    active,
    withResponses,
    inactive: total - active
  }
}
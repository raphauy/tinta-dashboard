import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { type FormResponse, type FormResponseFile, type Form, type Workspace, ResponseStatus, type Prisma } from "@prisma/client"

// ✅ Validaciones al inicio del archivo
export const formResponseFileSchema = z.object({
  fieldName: z.string().min(1, "Nombre de campo requerido"),
  fileName: z.string().min(1, "Nombre de archivo requerido"),
  fileUrl: z.string().url("URL de archivo inválida"),
  fileSize: z.number().int().min(1, "Tamaño de archivo debe ser positivo"),
  fileType: z.string().min(1, "Tipo de archivo requerido")
})

export const submitResponseSchema = z.object({
  formId: z.string().min(1, "ID de formulario requerido"),
  data: z.record(z.any()),
  files: z.array(formResponseFileSchema).optional().default([]),
  submitterIP: z.string().ip().optional()
})

export const updateResponseStatusSchema = z.object({
  status: z.nativeEnum(ResponseStatus, {
    errorMap: () => ({ message: "Estado de respuesta inválido" })
  })
})

// Tipos derivados de schemas
export type FormResponseFileData = z.infer<typeof formResponseFileSchema>
export type SubmitResponseData = z.infer<typeof submitResponseSchema>
export type UpdateResponseStatusData = z.infer<typeof updateResponseStatusSchema>

// Tipos extendidos para queries
export type ResponseWithFiles = FormResponse & {
  files: FormResponseFile[]
}

export type ResponseWithForm = FormResponse & {
  files: FormResponseFile[]
  form: Form & {
    workspace: Pick<Workspace, 'id' | 'name' | 'slug'>
  }
}

export type ResponseForNotification = FormResponse & {
  files: FormResponseFile[]
  form: Form & {
    workspace: Workspace & {
      users: Array<{
        user: {
          id: string
          name: string | null
          email: string
        }
      }>
    }
  }
}

/**
 * Envía una nueva respuesta de formulario
 */
export async function submitFormResponse(data: SubmitResponseData): Promise<ResponseForNotification> {
  const validated = submitResponseSchema.parse(data)
  
  return await prisma.formResponse.create({
    data: {
      formId: validated.formId,
      data: validated.data as Prisma.InputJsonValue,
      submitterIP: validated.submitterIP,
      files: {
        create: validated.files
      }
    },
    include: {
      files: true,
      form: {
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
          }
        }
      }
    }
  })
}

/**
 * Obtiene respuestas de un formulario específico
 */
export async function getFormResponses(formId: string): Promise<ResponseWithFiles[]> {
  return await prisma.formResponse.findMany({
    where: { formId },
    include: {
      files: true
    },
    orderBy: { submittedAt: 'desc' }
  })
}

/**
 * Obtiene una respuesta por ID
 */
export async function getFormResponseById(id: string): Promise<ResponseWithForm | null> {
  return await prisma.formResponse.findUnique({
    where: { id },
    include: {
      files: true,
      form: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    }
  })
}

/**
 * Actualiza el estado de una respuesta
 */
export async function updateResponseStatus(
  id: string, 
  status: ResponseStatus
): Promise<ResponseWithFiles> {
  const validated = updateResponseStatusSchema.parse({ status })
  
  return await prisma.formResponse.update({
    where: { id },
    data: { status: validated.status },
    include: {
      files: true
    }
  })
}

/**
 * Obtiene respuestas por workspace (todas las respuestas de formularios del workspace)
 */
export async function getResponsesByWorkspace(workspaceId: string): Promise<ResponseWithForm[]> {
  return await prisma.formResponse.findMany({
    where: {
      form: {
        workspaceId
      }
    },
    include: {
      files: true,
      form: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
}

/**
 * Obtiene respuestas recientes (para dashboard)
 */
export async function getRecentResponses(limit: number = 10): Promise<ResponseWithForm[]> {
  return await prisma.formResponse.findMany({
    take: limit,
    include: {
      files: true,
      form: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
}

/**
 * Obtiene respuestas por estado
 */
export async function getResponsesByStatus(
  workspaceId: string, 
  status: ResponseStatus
): Promise<ResponseWithForm[]> {
  return await prisma.formResponse.findMany({
    where: {
      status,
      form: {
        workspaceId
      }
    },
    include: {
      files: true,
      form: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
}

/**
 * Elimina una respuesta y sus archivos asociados
 */
export async function deleteFormResponse(id: string): Promise<void> {
  // Las relaciones en cascada eliminarán los archivos automáticamente
  await prisma.formResponse.delete({
    where: { id }
  })
}

/**
 * Obtiene estadísticas de respuestas para un workspace
 */
export async function getResponseStatsForWorkspace(workspaceId: string) {
  const [total, newResponses, reviewedResponses, processedResponses] = await Promise.all([
    prisma.formResponse.count({
      where: { form: { workspaceId } }
    }),
    prisma.formResponse.count({
      where: { 
        form: { workspaceId },
        status: 'new'
      }
    }),
    prisma.formResponse.count({
      where: { 
        form: { workspaceId },
        status: 'reviewed'
      }
    }),
    prisma.formResponse.count({
      where: { 
        form: { workspaceId },
        status: 'processed'
      }
    })
  ])
  
  return {
    total,
    new: newResponses,
    reviewed: reviewedResponses,
    processed: processedResponses
  }
}

/**
 * Obtiene estadísticas globales de respuestas (para admin dashboard)
 */
export async function getGlobalResponseStats() {
  const [total, newResponses, reviewedResponses, processedResponses, todayResponses] = await Promise.all([
    prisma.formResponse.count(),
    prisma.formResponse.count({ where: { status: 'new' } }),
    prisma.formResponse.count({ where: { status: 'reviewed' } }),
    prisma.formResponse.count({ where: { status: 'processed' } }),
    prisma.formResponse.count({
      where: {
        submittedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ])
  
  return {
    total,
    new: newResponses,
    reviewed: reviewedResponses,
    processed: processedResponses,
    today: todayResponses
  }
}

/**
 * Busca respuestas por contenido (para filtros en dashboard)
 */
export async function searchResponses(
  workspaceId: string,
  query: string
): Promise<ResponseWithForm[]> {
  // Nota: La búsqueda en JSON es limitada en Prisma, se podría mejorar con extensiones de PostgreSQL
  return await prisma.formResponse.findMany({
    where: {
      form: {
        workspaceId,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      }
    },
    include: {
      files: true,
      form: {
        include: {
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  })
}

/**
 * Verifica si una respuesta pertenece a un workspace específico
 */
export async function isResponseInWorkspace(responseId: string, workspaceId: string): Promise<boolean> {
  const count = await prisma.formResponse.count({
    where: {
      id: responseId,
      form: {
        workspaceId
      }
    }
  })
  
  return count > 0
}
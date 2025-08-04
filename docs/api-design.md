# Diseño de API

## Server Actions

El proyecto seguirá el patrón establecido del starter kit utilizando **Server Actions** para todas las mutaciones, evitando la necesidad de crear API routes tradicionales.

### Gestión de Plantillas

#### `/src/app/admin/templates/actions.ts`
```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTemplateById 
} from '@/services/template-service'

// Esquemas de validación
const createTemplateSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'file']),
    label: z.string().min(1, 'Label requerido'),
    helpText: z.string().optional(),
    required: z.boolean(),
    order: z.number(),
    properties: z.record(z.any()).optional()
  }))
})

const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string()
})

export async function createTemplateAction(data: z.infer<typeof createTemplateSchema>) {
  const session = await auth()
  
  if (!session?.user?.role === 'superadmin') {
    return { error: 'No autorizado para crear plantillas globales' }
  }

  try {
    const validated = createTemplateSchema.parse(data)
    const template = await createTemplate({
      ...validated,
      createdById: session.user.id
    })
    
    revalidatePath('/admin/templates')
    return { success: true, template }
  } catch (error) {
    return { error: 'Error al crear plantilla' }
  }
}

export async function updateTemplateAction(data: z.infer<typeof updateTemplateSchema>) {
  const session = await auth()
  
  if (!session?.user?.role === 'superadmin') {
    return { error: 'No autorizado' }
  }

  try {
    const validated = updateTemplateSchema.parse(data)
    const template = await updateTemplate(validated.id, validated)
    
    revalidatePath('/admin/templates')
    revalidatePath(`/admin/templates/${validated.id}`)
    return { success: true, template }
  } catch (error) {
    return { error: 'Error al actualizar plantilla' }
  }
}

export async function deleteTemplateAction(templateId: string) {
  const session = await auth()
  
  if (!session?.user?.role === 'superadmin') {
    return { error: 'No autorizado' }
  }

  try {
    await deleteTemplate(templateId)
    revalidatePath('/admin/templates')
    return { success: true }
  } catch (error) {
    return { error: 'Error al eliminar plantilla' }
  }
}

export async function promoteFormToTemplateAction(formId: string, templateData: { name: string, description?: string }) {
  const session = await auth()
  
  // Verificar que el usuario puede acceder al formulario
  const form = await getFormById(formId)
  if (!form || !await isUserWorkspaceAdmin(session.user.id, form.workspaceId)) {
    return { error: 'No autorizado' }
  }

  try {
    const template = await createTemplate({
      name: templateData.name,
      description: templateData.description,
      fields: form.fields,
      createdById: session.user.id
    })
    
    revalidatePath('/admin/templates')
    return { success: true, template }
  } catch (error) {
    return { error: 'Error al promocionar formulario a plantilla' }
  }
}
```

### Gestión de Formularios

#### `/src/app/w/[slug]/forms/actions.ts`
```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { 
  createForm, 
  updateForm, 
  deleteForm,
  generateShareToken,
  updateFormStatus 
} from '@/services/form-service'
import { isUserInWorkspace } from '@/services/workspace-service'

const createFormSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  workspaceId: z.string(),
  templateId: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'file']),
    label: z.string().min(1, 'Label requerido'),
    helpText: z.string().optional(),
    required: z.boolean(),
    order: z.number(),
    properties: z.record(z.any()).optional()
  })),
  allowEdits: z.boolean().default(false)
})

export async function createFormAction(data: z.infer<typeof createFormSchema>) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  // Verificar membresía en workspace
  const hasAccess = await isUserInWorkspace(session.user.id, data.workspaceId)
  if (!hasAccess) {
    return { error: 'No tienes acceso a este workspace' }
  }

  try {
    const validated = createFormSchema.parse(data)
    const form = await createForm({
      ...validated,
      createdById: session.user.id,
      shareToken: generateShareToken()
    })
    
    revalidatePath(`/w/${data.workspaceSlug}/forms`)
    return { success: true, form }
  } catch (error) {
    return { error: 'Error al crear formulario' }
  }
}

export async function updateFormAction(formId: string, data: Partial<z.infer<typeof createFormSchema>>) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const form = await getFormById(formId)
    if (!form) {
      return { error: 'Formulario no encontrado' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    const updatedForm = await updateForm(formId, data)
    
    revalidatePath(`/w/${form.workspace.slug}/forms`)
    revalidatePath(`/w/${form.workspace.slug}/forms/${formId}`)
    return { success: true, form: updatedForm }
  } catch (error) {
    return { error: 'Error al actualizar formulario' }
  }
}

export async function toggleFormStatusAction(formId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const form = await getFormById(formId)
    if (!form) {
      return { error: 'Formulario no encontrado' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    const updatedForm = await updateFormStatus(formId, !form.isActive)
    
    revalidatePath(`/w/${form.workspace.slug}/forms`)
    return { success: true, form: updatedForm }
  } catch (error) {
    return { error: 'Error al cambiar estado del formulario' }
  }
}

export async function deleteFormAction(formId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const form = await getFormById(formId)
    if (!form) {
      return { error: 'Formulario no encontrado' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    await deleteForm(formId)
    
    revalidatePath(`/w/${form.workspace.slug}/forms`)
    return { success: true }
  } catch (error) {
    return { error: 'Error al eliminar formulario' }
  }
}

export async function regenerateShareTokenAction(formId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const form = await getFormById(formId)
    if (!form) {
      return { error: 'Formulario no encontrado' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    const newToken = generateShareToken()
    const updatedForm = await updateForm(formId, { shareToken: newToken })
    
    revalidatePath(`/w/${form.workspace.slug}/forms/${formId}/share`)
    return { success: true, shareToken: newToken }
  } catch (error) {
    return { error: 'Error al regenerar enlace' }
  }
}
```

### Gestión de Respuestas

#### `/src/app/f/[token]/actions.ts`
```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { 
  submitFormResponse,
  uploadFormFiles,
  getFormByToken 
} from '@/services/form-response-service'
import { sendFormSubmissionNotification } from '@/services/email-service'

const submitFormSchema = z.object({
  formToken: z.string(),
  data: z.record(z.any()),
  files: z.array(z.object({
    fieldName: z.string(),
    file: z.instanceof(File)
  })).optional()
})

export async function submitPublicFormAction(formData: FormData) {
  try {
    const formToken = formData.get('formToken') as string
    
    // Verificar que el formulario existe y está activo
    const form = await getFormByToken(formToken)
    if (!form || !form.isActive) {
      return { error: 'Formulario no válido o inactivo' }
    }

    // Extraer datos del formulario
    const responseData: Record<string, any> = {}
    const files: Array<{ fieldName: string, file: File }> = []

    // Procesar campos de texto
    form.fields.forEach(field => {
      if (field.type === 'text' || field.type === 'textarea') {
        const value = formData.get(field.id) as string
        if (value) {
          responseData[field.id] = value
        }
      } else if (field.type === 'file') {
        const fileList = formData.getAll(field.id) as File[]
        fileList.forEach(file => {
          if (file.size > 0) {
            files.push({ fieldName: field.id, file })
          }
        })
      }
    })

    // Validar campos requeridos
    const missingRequired = form.fields
      .filter(field => field.required)
      .filter(field => {
        if (field.type === 'file') {
          return !files.some(f => f.fieldName === field.id)
        }
        return !responseData[field.id]
      })

    if (missingRequired.length > 0) {
      return { 
        error: 'Campos requeridos faltantes', 
        missingFields: missingRequired.map(f => f.label) 
      }
    }

    // Subir archivos
    const uploadedFiles = await uploadFormFiles(files)

    // Crear respuesta
    const response = await submitFormResponse({
      formId: form.id,
      data: responseData,
      files: uploadedFiles
    })

    // Enviar notificación
    await sendFormSubmissionNotification({
      form,
      response,
      workspaceMembers: form.workspace.users
    })

    return { success: true, responseId: response.id }
  } catch (error) {
    console.error('Error submitting form:', error)
    return { error: 'Error al enviar formulario' }
  }
}

export async function updatePublicFormResponseAction(responseId: string, formData: FormData) {
  try {
    const response = await getFormResponseById(responseId)
    if (!response || !response.form.allowEdits) {
      return { error: 'No se permiten ediciones en este formulario' }
    }

    // Similar logic to submitPublicFormAction but updating existing response
    // ... implementation details
    
    return { success: true, responseId: response.id }
  } catch (error) {
    return { error: 'Error al actualizar respuesta' }
  }
}
```

### Gestión de Respuestas (Workspace)

#### `/src/app/w/[slug]/forms/[formId]/responses/actions.ts`
```typescript
'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { 
  updateResponseStatus,
  exportResponseToPDF,
  getFormResponseById 
} from '@/services/form-response-service'
import { isUserInWorkspace } from '@/services/workspace-service'

export async function updateResponseStatusAction(
  responseId: string, 
  status: 'new' | 'reviewed' | 'processed'
) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const response = await getFormResponseById(responseId)
    if (!response) {
      return { error: 'Respuesta no encontrada' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, response.form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    const updatedResponse = await updateResponseStatus(responseId, status)
    
    revalidatePath(`/w/${response.form.workspace.slug}/forms/${response.formId}/responses`)
    return { success: true, response: updatedResponse }
  } catch (error) {
    return { error: 'Error al actualizar estado' }
  }
}

export async function exportResponseAction(responseId: string) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: 'No autenticado' }
  }

  try {
    const response = await getFormResponseById(responseId)
    if (!response) {
      return { error: 'Respuesta no encontrada' }
    }

    const hasAccess = await isUserInWorkspace(session.user.id, response.form.workspaceId)
    if (!hasAccess) {
      return { error: 'No autorizado' }
    }

    const pdfUrl = await exportResponseToPDF(responseId)
    
    return { success: true, pdfUrl }
  } catch (error) {
    return { error: 'Error al exportar respuesta' }
  }
}
```

## Operaciones de Base de Datos

### Servicios de Datos Principales

#### Template Service
```typescript
// src/services/template-service.ts
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'file']),
    label: z.string(),
    helpText: z.string().optional(),
    required: z.boolean(),
    order: z.number(),
    properties: z.record(z.any()).optional()
  })),
  createdById: z.string()
})

export async function createTemplate(data: z.infer<typeof createTemplateSchema>) {
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

export async function getTemplates() {
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

export async function getTemplateById(id: string) {
  return await prisma.formTemplate.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

export async function updateTemplate(id: string, data: Partial<z.infer<typeof createTemplateSchema>>) {
  return await prisma.formTemplate.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.fields && { fields: data.fields })
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

export async function deleteTemplate(id: string) {
  // Verificar que no hay formularios usando esta plantilla
  const formsCount = await prisma.form.count({
    where: { templateId: id }
  })
  
  if (formsCount > 0) {
    throw new Error('No se puede eliminar plantilla en uso')
  }
  
  return await prisma.formTemplate.delete({
    where: { id }
  })
}
```

#### Form Service
```typescript
// src/services/form-service.ts
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export function generateShareToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export const createFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  workspaceId: z.string(),
  templateId: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'file']),
    label: z.string(),
    helpText: z.string().optional(),
    required: z.boolean(),
    order: z.number(),
    properties: z.record(z.any()).optional()
  })),
  allowEdits: z.boolean(),
  shareToken: z.string(),
  createdById: z.string()
})

export async function createForm(data: z.infer<typeof createFormSchema>) {
  const validated = createFormSchema.parse(data)
  
  return await prisma.form.create({
    data: validated,
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  })
}

export async function getFormsByWorkspace(workspaceId: string) {
  return await prisma.form.findMany({
    where: { workspaceId },
    include: {
      template: {
        select: { id: true, name: true }
      },
      createdBy: {
        select: { id: true, name: true }
      },
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getFormById(id: string) {
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

export async function getFormByToken(token: string) {
  return await prisma.form.findUnique({
    where: { shareToken: token },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
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
  })
}

export async function updateForm(id: string, data: Partial<z.infer<typeof createFormSchema>>) {
  return await prisma.form.update({
    where: { id },
    data,
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      },
      template: {
        select: { id: true, name: true }
      }
    }
  })
}

export async function updateFormStatus(id: string, isActive: boolean) {
  return await prisma.form.update({
    where: { id },
    data: { isActive },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true }
      }
    }
  })
}

export async function deleteForm(id: string) {
  // Verificar que no hay respuestas
  const responsesCount = await prisma.formResponse.count({
    where: { formId: id }
  })
  
  if (responsesCount > 0) {
    throw new Error('No se puede eliminar formulario con respuestas')
  }
  
  return await prisma.form.delete({
    where: { id }
  })
}
```

#### Form Response Service
```typescript
// src/services/form-response-service.ts
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { uploadFile } from './upload-service'

export const submitResponseSchema = z.object({
  formId: z.string(),
  data: z.record(z.any()),
  files: z.array(z.object({
    fieldName: z.string(),
    fileName: z.string(),
    fileUrl: z.string(),
    fileSize: z.number(),
    fileType: z.string()
  }))
})

export async function submitFormResponse(data: z.infer<typeof submitResponseSchema>) {
  const validated = submitResponseSchema.parse(data)
  
  return await prisma.formResponse.create({
    data: {
      formId: validated.formId,
      data: validated.data,
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

export async function uploadFormFiles(files: Array<{ fieldName: string, file: File }>) {
  const uploadPromises = files.map(async ({ fieldName, file }) => {
    const fileUrl = await uploadFile(file, `form-uploads/${Date.now()}-${file.name}`)
    
    return {
      fieldName,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type
    }
  })
  
  return await Promise.all(uploadPromises)
}

export async function getFormResponses(formId: string) {
  return await prisma.formResponse.findMany({
    where: { formId },
    include: {
      files: true
    },
    orderBy: { submittedAt: 'desc' }
  })
}

export async function getFormResponseById(id: string) {
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

export async function updateResponseStatus(
  id: string, 
  status: 'new' | 'reviewed' | 'processed'
) {
  return await prisma.formResponse.update({
    where: { id },
    data: { status },
    include: {
      files: true,
      form: {
        select: { id: true, name: true }
      }
    }
  })
}
```

## Integración con APIs Externas

### Email Service Extension
```typescript
// src/services/email-service.ts - Extension
import { FormSubmissionNotification } from '@/components/emails/form-submission-notification'

export async function sendFormSubmissionNotification({
  form,
  response,
  workspaceMembers
}: {
  form: Form & { workspace: Workspace }
  response: FormResponse
  workspaceMembers: Array<{ user: User }>
}) {
  const emailPromises = workspaceMembers.map(async ({ user }) => {
    const emailHtml = await render(FormSubmissionNotification({
      userName: user.name || user.email,
      formName: form.name,
      workspaceName: form.workspace.name,
      submissionDate: response.submittedAt,
      viewResponseUrl: `${process.env.NEXTAUTH_URL}/w/${form.workspace.slug}/forms/${form.id}/responses/${response.id}`
    }))

    return await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: `Nueva respuesta: ${form.name} - ${form.workspace.name}`,
      html: emailHtml
    })
  })

  return await Promise.allSettled(emailPromises)
}
```

### File Storage Integration
```typescript
// src/services/upload-service.ts - Extension
import { put } from '@vercel/blob'

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'application/zip'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function uploadFormFile(file: File, path: string): Promise<string> {
  // Validar tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`)
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Archivo muy grande: ${file.size} bytes (máximo ${MAX_FILE_SIZE})`)
  }

  try {
    const blob = await put(path, file, {
      access: 'public'
    })

    return blob.url
  } catch (error) {
    throw new Error('Error al subir archivo')
  }
}

export async function deleteFormFile(url: string): Promise<void> {
  try {
    await fetch(`${url}?delete=true`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error al eliminar archivo:', error)
  }
}
```

## Middleware y Autenticación

### Extension del Middleware Existente
```typescript
// src/middleware.ts - Extension
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Rutas de formularios públicos (sin autenticación)
  if (pathname.startsWith('/f/')) {
    return NextResponse.next()
  }

  // Rutas de admin (solo superadmins)
  if (pathname.startsWith('/admin/templates')) {
    if (!session?.user?.role || session.user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Rutas de workspace/forms (miembros del workspace)
  if (pathname.match(/^\/w\/[^\/]+\/forms/)) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const workspaceSlug = pathname.split('/')[2]
    // Verificar acceso al workspace (implementar verificación)
    // const hasAccess = await verifyWorkspaceAccess(session.user.id, workspaceSlug)
    // if (!hasAccess) {
    //   return NextResponse.redirect(new URL('/unauthorized', request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/w/:path*',
    '/f/:path*'
  ]
}
```

## Rate Limiting y Seguridad

### Rate Limiting para Formularios Públicos
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit
        
        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}

// Uso en form submission
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // límite de 500 users por minuto
})

export async function submitPublicFormAction(formData: FormData) {
  const ip = headers().get('x-forwarded-for') || 'anonymous'
  
  try {
    await limiter.check(5, ip) // máximo 5 submissions por IP por minuto
  } catch {
    return { error: 'Demasiadas solicitudes, intenta más tarde' }
  }

  // ... resto de la lógica
}
```
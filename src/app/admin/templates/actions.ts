'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  type CreateTemplateData,
  type UpdateTemplateData
} from '@/services/template-service'

// Server Actions para gestión de plantillas

export async function createTemplateAction(data: CreateTemplateData) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'superadmin') {
    return { error: 'No autorizado para crear plantillas globales' }
  }

  try {
    const template = await createTemplate({
      ...data,
      createdById: session.user.id
    })
    
    revalidatePath('/admin/templates')
    return { success: true, template }
  } catch (error) {
    console.error('Error creating template:', error)
    return { error: 'Error al crear plantilla' }
  }
}

export async function updateTemplateAction(templateId: string, data: UpdateTemplateData) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'superadmin') {
    return { error: 'No autorizado para actualizar plantillas' }
  }

  try {
    const template = await updateTemplate(templateId, data)
    
    revalidatePath('/admin/templates')
    revalidatePath(`/admin/templates/${templateId}`)
    return { success: true, template }
  } catch (error) {
    console.error('Error updating template:', error)
    return { error: 'Error al actualizar plantilla' }
  }
}

export async function deleteTemplateAction(templateId: string) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'superadmin') {
    return { error: 'No autorizado para eliminar plantillas' }
  }

  try {
    await deleteTemplate(templateId)
    
    revalidatePath('/admin/templates')
    return { success: true }
  } catch (error) {
    console.error('Error deleting template:', error)
    if (error instanceof Error && error.message.includes('en uso')) {
      return { error: error.message }
    }
    return { error: 'Error al eliminar plantilla' }
  }
}
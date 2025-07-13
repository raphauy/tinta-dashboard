'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { deleteForm, updateFormStatus, createForm, generateShareToken } from '@/services/form-service'
import { getWorkspaceBySlug } from '@/services/workspace-service'
import { type CreateFormData } from '@/services/form-service'
import { type FormField } from '@/types/form-field'

type ActionResult = {
  success: boolean
  error?: string
  data?: unknown
}

/**
 * Elimina un formulario
 */
export async function deleteFormAction(formId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    await deleteForm(formId)

    revalidatePath('/w/[slug]/forms', 'page')
    return { success: true }
  } catch (error) {
    console.error('Error deleting form:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }
  }
}

/**
 * Actualiza el estado activo/inactivo de un formulario
 */
export async function updateFormStatusAction(
  formId: string, 
  isActive: boolean
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    await updateFormStatus(formId, isActive)

    revalidatePath('/w/[slug]/forms', 'page')
    return { success: true }
  } catch (error) {
    console.error('Error updating form status:', error)
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    }
  }
}

/**
 * Crea un nuevo formulario desde una plantilla
 */
export async function createFormFromTemplateAction(data: {
  title: string
  title2?: string
  color?: string
  subtitle?: string
  projectName?: string
  client?: string
  allowEdits?: boolean
  workspaceSlug: string
  templateId?: string
  fields: FormField[]
}): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const workspace = await getWorkspaceBySlug(data.workspaceSlug)
    if (!workspace) {
      return { success: false, error: 'Workspace no encontrado' }
    }

    const shareToken = generateShareToken()

    const formData: CreateFormData = {
      title: data.title,
      title2: data.title2,
      color: data.color,
      subtitle: data.subtitle,
      projectName: data.projectName,
      client: data.client,
      workspaceId: workspace.id,
      templateId: data.templateId,
      fields: data.fields,
      allowEdits: data.allowEdits ?? false,
      shareToken,
      createdById: session.user.id
    }

    await createForm(formData)

    revalidatePath(`/w/${data.workspaceSlug}/forms`)
    
    // El redirect debe estar fuera del try/catch para que Next.js lo maneje correctamente
  } catch (error) {
    console.error('Error creating form:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }
  }
  
  // Redirect exitoso después de crear el formulario
  redirect(`/w/${data.workspaceSlug}/forms`)
}
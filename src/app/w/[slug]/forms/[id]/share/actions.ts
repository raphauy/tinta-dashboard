'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { 
  updateFormStatus, 
  updateForm, 
  regenerateShareToken,
  getFormById 
} from '@/services/form-service'
import { isUserWorkspaceAdmin, isUserInWorkspace } from '@/services/workspace-service'

type ActionResult = {
  success: boolean
  error?: string
  data?: unknown
}

/**
 * Regenera el token de compartir de un formulario
 */
export async function regenerateFormTokenAction(
  formId: string,
  workspaceSlug: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const form = await getFormById(formId)
    if (!form) {
      return { success: false, error: 'Formulario no encontrado' }
    }

    const isAdmin = await isUserWorkspaceAdmin(session.user.id, form.workspaceId)
    if (!isAdmin) {
      return { success: false, error: 'Solo los administradores pueden regenerar tokens' }
    }

    const newToken = await regenerateShareToken(formId)

    revalidatePath(`/w/${workspaceSlug}/forms/${formId}/share`)
    revalidatePath(`/w/${workspaceSlug}/forms/${formId}`)
    
    return { 
      success: true, 
      data: { newToken } 
    }
  } catch (error) {
    console.error('Error regenerating form token:', error)
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    }
  }
}

/**
 * Actualiza los permisos de edición del formulario
 */
export async function updateFormPermissionsAction(
  formId: string,
  allowEdits: boolean,
  workspaceSlug: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const form = await getFormById(formId)
    if (!form) {
      return { success: false, error: 'Formulario no encontrado' }
    }

    const isAdmin = await isUserWorkspaceAdmin(session.user.id, form.workspaceId)
    if (!isAdmin) {
      return { success: false, error: 'Solo los administradores pueden cambiar permisos' }
    }

    await updateForm(formId, { allowEdits })

    revalidatePath(`/w/${workspaceSlug}/forms/${formId}/share`)
    revalidatePath(`/w/${workspaceSlug}/forms/${formId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form permissions:', error)
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    }
  }
}

/**
 * Actualiza el estado activo/inactivo del formulario
 */
export async function toggleFormStatusAction(
  formId: string,
  isActive: boolean,
  workspaceSlug: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    const form = await getFormById(formId)
    if (!form) {
      return { success: false, error: 'Formulario no encontrado' }
    }

    const userInWorkspace = await isUserInWorkspace(session.user.id, form.workspaceId)
    if (!userInWorkspace) {
      return { success: false, error: 'No tienes acceso a este workspace' }
    }

    await updateFormStatus(formId, isActive)

    revalidatePath(`/w/${workspaceSlug}/forms`)
    revalidatePath(`/w/${workspaceSlug}/forms/${formId}`)
    revalidatePath(`/w/${workspaceSlug}/forms/${formId}/share`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form status:', error)
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    }
  }
}
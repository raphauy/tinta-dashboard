'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { updateForm } from '@/services/form-service'

type ActionResult = {
  success: boolean
  error?: string
}

/**
 * Actualiza un formulario existente
 */
export async function updateFormAction(
  formId: string,
  data: {
    name?: string
    description?: string
    isActive?: boolean
  }
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    await updateForm(formId, data)

    revalidatePath('/w/[slug]/forms', 'page')
    revalidatePath(`/w/[slug]/forms/${formId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }
  }
}
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { updateForm } from '@/services/form-service'
import { type FormField } from '@/types/form-field'

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
    title?: string
    title2?: string
    color?: string
    subtitle?: string
    projectName?: string
    client?: string
    allowEdits?: boolean
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

/**
 * Actualiza los campos de un formulario existente
 */
export async function updateFormFieldsAction(
  formId: string,
  fields: FormField[]
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autorizado' }
    }

    // Validar que hay al menos un campo
    if (fields.length === 0) {
      return { success: false, error: 'Debe haber al menos un campo' }
    }

    // Validar que todos los campos tienen etiqueta
    const invalidFields = fields.filter(field => !field.label.trim())
    if (invalidFields.length > 0) {
      return { success: false, error: 'Todos los campos deben tener una etiqueta' }
    }

    await updateForm(formId, { fields })

    revalidatePath('/w/[slug]/forms', 'page')
    revalidatePath(`/w/[slug]/forms/${formId}`, 'page')
    revalidatePath(`/w/[slug]/forms/${formId}/edit`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating form fields:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }
  }
}
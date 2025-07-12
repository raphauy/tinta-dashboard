"use server"

import { revalidatePath } from "next/cache"
import { submitFormResponse as submitResponse } from "@/services/form-response-service"
import { getFormByToken } from "@/services/form-service"
import { sendFormSubmissionNotification } from "@/services/email-service"
import { put } from "@vercel/blob"
import { type FormField } from "@/types/form-field"

/**
 * Server Action para procesar envío de formularios públicos
 */
export async function submitFormResponse(formId: string, formData: Record<string, unknown>) {
  try {
    // 1. Obtener el formulario y validar que existe y está activo
    const form = await getFormByToken(formId) // Usamos el token como formId en este contexto
    if (!form || !form.isActive) {
      throw new Error('Formulario no encontrado o inactivo')
    }

    // 2. Procesar archivos si existen
    const processedFiles: Array<{
      fieldName: string
      fileName: string
      fileUrl: string
      fileSize: number
      fileType: string
    }> = []

    const fields = form.fields as FormField[]
    const fileFields = fields.filter(field => field.type === 'file')

    for (const field of fileFields) {
      const fieldFiles = formData[field.id]
      if (fieldFiles && Array.isArray(fieldFiles)) {
        for (const file of fieldFiles) {
          if (file instanceof File) {
            // Validar archivo
            if (file.size > 10 * 1024 * 1024) { // 10MB
              throw new Error(`Archivo ${file.name} es muy grande (máximo 10MB)`)
            }

            const allowedTypes = [
              'application/pdf',
              'application/msword', 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'image/jpeg',
              'image/png',
              'application/zip'
            ]

            if (!allowedTypes.includes(file.type)) {
              throw new Error(`Tipo de archivo ${file.type} no permitido`)
            }

            // Subir a Vercel Blob
            const timestamp = Date.now()
            const fileName = `${timestamp}-${file.name}`
            const blob = await put(fileName, file, {
              access: 'public',
              addRandomSuffix: true
            })

            processedFiles.push({
              fieldName: field.id,
              fileName: file.name,
              fileUrl: blob.url,
              fileSize: file.size,
              fileType: file.type
            })
          }
        }
      }
    }

    // 3. Preparar datos para guardar (sin archivos)
    const cleanData = { ...formData }
    fileFields.forEach(field => {
      delete cleanData[field.id] // Remover archivos de los datos principales
    })

    // 4. Crear la respuesta en la base de datos
    const response = await submitResponse({
      formId: form.id, // Usar el ID real del formulario
      data: cleanData,
      files: processedFiles,
      submitterIP: undefined // TODO: Obtener IP del request si es necesario
    })

    // 5. Enviar notificaciones por email a todos los miembros del workspace
    try {
      const workspaceMembers = response.form.workspace.users
      const memberEmails = workspaceMembers.map(member => member.user.email)
      
      if (memberEmails.length > 0) {
        const notificationResult = await sendFormSubmissionNotification({
          to: memberEmails,
          formName: response.form.name,
          workspaceName: response.form.workspace.name,
          workspaceSlug: response.form.workspace.slug,
          responseId: response.id,
          formId: response.form.id,
          fieldsCount: Object.keys(cleanData).length,
          filesCount: processedFiles.length,
          submittedAt: new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        })
        
        if (!notificationResult.success) {
          console.error('Error sending email notifications:', notificationResult.error)
          // No fallar la submission por errores de email
        }
      }
    } catch (emailError) {
      console.error('Error sending email notifications:', emailError)
      // No fallar la submission por errores de email
    }

    console.log('📝 Form response created:', {
      responseId: response.id,
      formName: response.form.name,
      workspaceName: response.form.workspace.name,
      filesCount: processedFiles.length,
      membersNotified: response.form.workspace.users.length,
      timestamp: new Date().toISOString()
    })

    // 6. Revalidar rutas relacionadas
    revalidatePath(`/w/${response.form.workspace.slug}/forms/${response.form.id}`)
    revalidatePath(`/w/${response.form.workspace.slug}/forms`)

    return { 
      success: true, 
      message: 'Formulario enviado correctamente',
      responseId: response.id
    }

  } catch (error) {
    console.error('Error submitting form response:', error)
    
    // Retornar error específico al usuario
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor'

    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Helper para validar token de formulario
 * PLACEHOLDER - Se expandirá en siguientes fases
 */
export async function validateFormToken(token: string) {
  // TODO: Implementar validación completa
  // 1. Verificar token existe y es válido
  // 2. Verificar formulario está activo
  // 3. Verificar permisos de acceso
  
  console.log('🔐 Validating form token:', token)
  return { valid: true }
}
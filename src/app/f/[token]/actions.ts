"use server"

import { revalidatePath } from "next/cache"
import { submitFormResponse as submitResponse } from "@/services/form-response-service"
import { getFormByToken } from "@/services/form-service"
import { sendFormSubmissionNotification } from "@/services/email-service"
import { getClientIP } from "@/lib/get-client-ip"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { type FormField } from "@/types/form-field"

/**
 * Server Action para procesar envío de formularios públicos (versión PDF-style)
 */
export async function submitFormResponse(formId: string, formData: Record<string, unknown>) {
  try {
    // 1. Obtener el formulario y validar que existe y está activo
    const form = await getFormByToken(formId) // Usamos el token como formId en este contexto
    if (!form || !form.isActive) {
      throw new Error('Formulario no encontrado o inactivo')
    }

    // 2. Verificar si ya hay respuestas y no se permiten múltiples envíos
    const responseCount = await prisma.formResponse.count({
      where: { formId: form.id }
    })
    
    if (responseCount > 0 && !form.allowEdits) {
      throw new Error('Este formulario ya no acepta más respuestas')
    }
    
    // 3. Obtener IP para el registro
    const clientIP = await getClientIP()

    // 3. Procesar archivos si existen
    const processedFiles: Array<{
      fieldName: string
      fileName: string
      fileUrl: string
      fileSize: number
      fileType: string
    }> = []

    const fields = form.fields as FormField[]
    const fieldsWithAttachments = fields.filter(field => field.allowAttachments)

    for (const field of fieldsWithAttachments) {
      const fieldFiles = formData[`${field.id}_files`]
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
    
    // Remover las claves especiales de archivos (_files)
    Object.keys(cleanData).forEach(key => {
      if (key.endsWith('_files')) {
        delete cleanData[key]
      }
    })

    // 4. Crear la respuesta en la base de datos
    const response = await submitResponse({
      formId: form.id, // Usar el ID real del formulario
      data: cleanData,
      files: processedFiles,
      submitterIP: clientIP // IP obtenida al inicio de la función
    })

    // 5. Enviar notificaciones por email a todos los colaboradores del workspace
    try {
      const workspaceMembers = response.form.workspace.users
      const memberEmails = workspaceMembers.map(member => member.user.email)
      
      if (memberEmails.length > 0) {
        const notificationResult = await sendFormSubmissionNotification({
          to: memberEmails,
          formName: response.form.title2 ? `${response.form.title} ${response.form.title2}` : response.form.title,
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

    console.log('📝 PDF-style form response created:', {
      responseId: response.id,
      formName: response.form.title2 ? `${response.form.title} ${response.form.title2}` : response.form.title,
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
    console.error('Error submitting PDF-style form response:', error)
    
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
import { Resend } from 'resend'
import { z } from 'zod'
import WorkspaceInvitationEmail from '@/components/emails/workspace-invitation-email'
import OtpEmail from '@/components/emails/otp-email'
import FormSubmissionNotification from '@/components/emails/form-submission-notification'

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Esquemas de validación
export const sendInvitationEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  inviterName: z.string().min(1, "Nombre del invitador requerido"),
  workspaceName: z.string().min(1, "Nombre del workspace requerido"),
  acceptUrl: z.string().url("URL de aceptación inválida"),
  expiresInDays: z.number().min(1).max(30).default(7)
})

// Tipos
export type SendInvitationEmailInput = z.infer<typeof sendInvitationEmailSchema>

/**
 * Envía un email de invitación al workspace
 */
export async function sendWorkspaceInvitationEmail(input: SendInvitationEmailInput) {
  try {
    const validatedInput = sendInvitationEmailSchema.parse(input)
    
    const appName = process.env.APP_NAME || "Tinta Agency"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
    
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [validatedInput.to],
      subject: `Invitación a "${validatedInput.workspaceName}" en Tinta Agency`,
      react: WorkspaceInvitationEmail({
        invitedUserEmail: validatedInput.to,
        inviterName: validatedInput.inviterName,
        workspaceName: validatedInput.workspaceName,
        acceptUrl: validatedInput.acceptUrl,
        expiresInDays: validatedInput.expiresInDays
      }),
    })
    
    if (error) {
      console.error('Error sending invitation email:', error)
      return { 
        success: false, 
        error: `Error al enviar el email: ${error.message}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        emailId: data?.id,
        message: "Email de invitación enviado correctamente" 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error sending invitation email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el email de invitación' 
    }
  }
}

/**
 * Genera la URL de aceptación de invitación
 */
export function generateInvitationAcceptUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${baseUrl}/invite/${token}`
}

// Esquemas de validación para OTP
export const sendOtpEmailSchema = z.object({
  to: z.string().email("Email inválido"),
  otp: z.string().min(6, "OTP debe tener al menos 6 caracteres"),
})

export type SendOtpEmailInput = z.infer<typeof sendOtpEmailSchema>

// Esquemas de validación para notificaciones de formulario
export const sendFormSubmissionNotificationSchema = z.object({
  to: z.array(z.string().email("Email inválido")).min(1, "Al menos un destinatario requerido"),
  formName: z.string().min(1, "Nombre del formulario requerido"),
  workspaceName: z.string().min(1, "Nombre del workspace requerido"),
  workspaceSlug: z.string().min(1, "Slug del workspace requerido"),
  responseId: z.string().min(1, "ID de respuesta requerido"),
  formId: z.string().min(1, "ID de formulario requerido"),
  fieldsCount: z.number().min(0, "Cantidad de campos debe ser positiva"),
  filesCount: z.number().min(0, "Cantidad de archivos debe ser positiva"),
  submittedAt: z.string().min(1, "Fecha de envío requerida")
})

export type SendFormSubmissionNotificationInput = z.infer<typeof sendFormSubmissionNotificationSchema>

/**
 * Envía notificaciones de nueva submission a todos los miembros del workspace
 */
export async function sendFormSubmissionNotification(input: SendFormSubmissionNotificationInput) {
  try {
    const validatedInput = sendFormSubmissionNotificationSchema.parse(input)
    
    const appName = process.env.APP_NAME || "Tinta Agency"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@tinta.wine"
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Generar URL para ver la respuesta
    const viewUrl = `${baseUrl}/w/${validatedInput.workspaceSlug}/forms/${validatedInput.formId}/responses/${validatedInput.responseId}`
    
    // Enviar email a todos los miembros del workspace
    const emailPromises = validatedInput.to.map(async (email) => {
      const { data, error } = await resend.emails.send({
        from: `${appName} <${fromEmail}>`,
        to: [email],
        subject: `Nueva respuesta: "${validatedInput.formName}" - ${validatedInput.workspaceName}`,
        react: FormSubmissionNotification({
          recipientName: email.split('@')[0], // Usar la parte antes del @ como nombre temporal
          formName: validatedInput.formName,
          workspaceName: validatedInput.workspaceName,
          submittedAt: validatedInput.submittedAt,
          fieldsCount: validatedInput.fieldsCount,
          filesCount: validatedInput.filesCount,
          viewUrl
        }),
      })
      
      return { email, data, error }
    })
    
    const results = await Promise.allSettled(emailPromises)
    
    // Procesar resultados
    const successful: string[] = []
    const failed: Array<{ email: string, error: string }> = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { email, error } = result.value
        if (error) {
          failed.push({ email, error: error.message })
        } else {
          successful.push(email)
        }
      } else {
        failed.push({ 
          email: validatedInput.to[index], 
          error: result.reason?.message || 'Error desconocido' 
        })
      }
    })
    
    console.log('📧 Form submission notifications sent:', {
      formName: validatedInput.formName,
      workspaceName: validatedInput.workspaceName,
      successful: successful.length,
      failed: failed.length,
      details: { successful, failed }
    })
    
    return {
      success: true,
      data: {
        totalSent: successful.length,
        totalFailed: failed.length,
        successful,
        failed,
        message: `Notificaciones enviadas: ${successful.length} exitosas, ${failed.length} fallidas`
      }
    }
    
  } catch (error: unknown) {
    console.error('Error sending form submission notifications:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar notificaciones de formulario' 
    }
  }
}

/**
 * Envía un email con el código OTP
 */
export async function sendOtpEmail(input: SendOtpEmailInput) {
  try {
    const validatedInput = sendOtpEmailSchema.parse(input)
    
    const appName = process.env.APP_NAME || "Tinta Agency"
    const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
    
    const { data, error } = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [validatedInput.to],
      subject: `Tu código de verificación de Tinta Agency`,
      react: OtpEmail({
        otp: validatedInput.otp
      }),
    })
    
    if (error) {
      console.error('Error sending OTP email:', error)
      return { 
        success: false, 
        error: `Error al enviar el email: ${error.message}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        emailId: data?.id,
        message: "Email OTP enviado correctamente" 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error sending OTP email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al enviar el email OTP' 
    }
  }
}
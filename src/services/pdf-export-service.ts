import { z } from "zod"
import { getFormResponseById } from "@/services/form-response-service"
import { getUserWorkspaces } from "@/services/workspace-service"
import { generatePDFFromHTML, RESPONSE_PDF_CONFIG } from "@/lib/pdf/puppeteer-config"
import { put } from '@vercel/blob'
import { type ResponseWithForm } from "@/services/form-response-service"
import { type FormResponseFile } from "@prisma/client"

// Esquemas de validación
export const generateResponsePDFSchema = z.object({
  responseId: z.string().min(1, "ID de respuesta requerido"),
  userId: z.string().min(1, "ID de usuario requerido"),
})

export const pdfOptionsSchema = z.object({
  includeImages: z.boolean().optional().default(true),
  includeMetadata: z.boolean().optional().default(true),
  format: z.enum(['A4', 'A3', 'Letter']).optional().default('A4'),
})

// Tipos
export type GenerateResponsePDFInput = z.infer<typeof generateResponsePDFSchema>
export type PDFOptions = z.infer<typeof pdfOptionsSchema>

export interface PDFGenerationResult {
  success: boolean
  pdfBuffer?: Buffer
  downloadUrl?: string
  filename?: string
  error?: string
}

/**
 * Convierte una imagen URL a base64
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error convirtiendo imagen a base64:', error)
    return null
  }
}

/**
 * Procesa las imágenes de una respuesta para optimizar su uso en PDFs
 */
export async function processResponseImages(response: ResponseWithForm): Promise<ResponseWithForm> {
  const processedResponse = { ...response }
  
  // Procesar archivos adjuntos
  if (processedResponse.files && processedResponse.files.length > 0) {
    const processedFiles = await Promise.all(
      processedResponse.files.map(async (file: FormResponseFile & { isBase64?: boolean }) => {
        // Solo procesar imágenes
        if (file.fileType.startsWith('image/')) {
          // Si la imagen es muy grande, podríamos optimizarla
          // Por ahora, solo las convertimos a base64 para embebir en el PDF
          if (file.fileSize < 2 * 1024 * 1024) { // Menos de 2MB
            const base64Image = await imageUrlToBase64(file.fileUrl)
            if (base64Image) {
              return {
                ...file,
                fileUrl: base64Image,
                isBase64: true
              }
            }
          }
        }
        return file
      })
    )
    
    processedResponse.files = processedFiles
  }
  
  return processedResponse
}

/**
 * Verifica si un usuario tiene acceso para exportar una respuesta
 */
async function verifyExportAccess(
  responseId: string, 
  userId: string
): Promise<{ hasAccess: boolean; workspaceId?: string }> {
  // Obtener la respuesta
  const response = await getFormResponseById(responseId)
  if (!response) {
    return { hasAccess: false }
  }

  const workspaceId = response.form.workspace.id

  // Verificar que el usuario pertenece al workspace
  const userWorkspaces = await getUserWorkspaces(userId)
  const workspace = userWorkspaces.find(uw => uw.workspaceId === workspaceId)
  
  if (!workspace) {
    return { hasAccess: false }
  }

  // Solo admins y members pueden exportar
  return { 
    hasAccess: true, // Si el usuario está en el workspace, puede exportar
    workspaceId 
  }
}

/**
 * Genera un PDF de una respuesta de formulario
 */
export async function generateResponsePDF(
  input: GenerateResponsePDFInput,
  options: Partial<PDFOptions> = {},
  html?: string
): Promise<PDFGenerationResult> {
  try {
    const validated = generateResponsePDFSchema.parse(input)
    const validatedOptions = pdfOptionsSchema.parse(options)

    // Verificar permisos
    const { hasAccess } = await verifyExportAccess(
      validated.responseId,
      validated.userId
    )

    if (!hasAccess) {
      return {
        success: false,
        error: 'No tienes permisos para exportar esta respuesta'
      }
    }

    // Si no se proporciona HTML, obtener la respuesta y prepararla
    let fullHTML: string
    let filename: string
    
    if (html) {
      fullHTML = html
      // Generar nombre de archivo básico
      const date = new Date().toISOString().split('T')[0]
      filename = `respuesta-${validated.responseId}-${date}.pdf`
    } else {
      // Obtener datos completos de la respuesta
      const response = await getFormResponseById(validated.responseId)
      if (!response) {
        return {
          success: false,
          error: 'Respuesta no encontrada'
        }
      }

      // No se puede generar PDF sin HTML pre-renderizado
      return {
        success: false,
        error: 'Se requiere HTML para generar el PDF'
      }
    }

    // Generar PDF con Puppeteer
    const pdfBuffer = await generatePDFFromHTML(
      fullHTML,
      {
        ...RESPONSE_PDF_CONFIG,
        format: validatedOptions.format || 'A4',
      }
    )

    return {
      success: true,
      pdfBuffer,
      filename
    }
  } catch (error) {
    console.error('Error generando PDF:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar el PDF'
    }
  }
}

/**
 * Genera un PDF y lo sube a Blob Storage (para URLs temporales)
 */
export async function generateResponsePDFWithUpload(
  input: GenerateResponsePDFInput,
  options: Partial<PDFOptions> = {}
): Promise<PDFGenerationResult> {
  try {
    // Generar el PDF
    const result = await generateResponsePDF(input, options)
    
    if (!result.success || !result.pdfBuffer || !result.filename) {
      return result
    }

    // Subir a Blob Storage con expiración de 1 hora
    const blob = await put(
      `pdf-exports/${input.responseId}/${result.filename}`,
      result.pdfBuffer,
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/pdf',
      }
    )

    return {
      success: true,
      downloadUrl: blob.url,
      filename: result.filename
    }
  } catch (error) {
    console.error('Error subiendo PDF:', error)
    
    return {
      success: false,
      error: 'Error al subir el PDF generado'
    }
  }
}

/**
 * Genera un PDF con reintentos en caso de fallo
 */
export async function generateResponsePDFWithRetry(
  input: GenerateResponsePDFInput,
  options: Partial<PDFOptions> = {},
  maxRetries = 3
): Promise<PDFGenerationResult> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Generando PDF, intento ${attempt} de ${maxRetries}`)
      
      const result = await generateResponsePDF(input, options)
      
      if (result.success) {
        return result
      }

      // Si el error es de permisos, no reintentar
      if (result.error?.includes('permisos')) {
        return result
      }

      lastError = new Error(result.error)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido')
      console.error(`Error en intento ${attempt}:`, error)
    }

    // Esperar antes de reintentar (backoff exponencial)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }
  }

  return {
    success: false,
    error: `Error después de ${maxRetries} intentos: ${lastError?.message || 'Error desconocido'}`
  }
}

/**
 * Obtiene estadísticas de exportación para un workspace
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getExportStats(workspaceId: string) {
  // Esta función podría expandirse en el futuro para trackear
  // cuántos PDFs se han generado, por quién, etc.
  // Por ahora el parámetro se mantiene para compatibilidad futura
  return {
    totalExports: 0,
    lastExportDate: null,
    exportsByUser: []
  }
}
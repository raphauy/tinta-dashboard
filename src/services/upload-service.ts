import { put, del } from '@vercel/blob'
import { z } from 'zod'

// Tipos de archivo permitidos para formularios
export const ALLOWED_FORM_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/x-zip-compressed'
] as const

export const MAX_FORM_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Esquemas de validación
export const uploadImageSchema = z.object({
  file: z.any(), // File object del navegador
  userId: z.string().min(1, "ID de usuario requerido"),
  folder: z.string().optional().default("avatars")
})

export const uploadFormFileSchema = z.object({
  file: z.any(), // File object del navegador
  fieldName: z.string().min(1, "Nombre de campo requerido"),
  folder: z.string().optional().default("form-uploads")
})

export const uploadWorkspaceImageSchema = z.object({
  file: z.any(), // File object del navegador
  workspaceId: z.string().min(1, "ID de workspace requerido"),
  folder: z.string().optional().default("workspace-images")
})

export const deleteImageSchema = z.object({
  url: z.string().url("URL de imagen inválida")
})

// Tipos
export type UploadImageInput = z.infer<typeof uploadImageSchema>
export type UploadFormFileInput = z.infer<typeof uploadFormFileSchema>
export type UploadWorkspaceImageInput = z.infer<typeof uploadWorkspaceImageSchema>
export type DeleteImageInput = z.infer<typeof deleteImageSchema>

/**
 * Sube una imagen de avatar de usuario a Vercel Blob Storage
 */
export async function uploadUserAvatar(input: UploadImageInput) {
  const validatedInput = uploadImageSchema.parse(input)
  
  // Validar que sea un archivo de imagen
  if (!validatedInput.file || !validatedInput.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (validatedInput.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 5MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = validatedInput.file.name.split('.').pop() || 'jpg'
    const fileName = `${validatedInput.folder}/${validatedInput.userId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false, // Ya tenemos timestamp para evitar colisiones
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: validatedInput.file.size,
      contentType: validatedInput.file.type
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error al subir la imagen')
  }
}

/**
 * Elimina una imagen de Vercel Blob Storage
 */
export async function deleteImage(input: DeleteImageInput) {
  const validatedInput = deleteImageSchema.parse(input)
  
  try {
    await del(validatedInput.url)
    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

/**
 * Elimina la imagen de avatar anterior de un usuario y sube una nueva
 */
export async function replaceUserAvatar(input: UploadImageInput & { currentImageUrl?: string }) {
  const validatedInput = uploadImageSchema.parse(input)
  
  try {
    // Subir nueva imagen
    const newImage = await uploadUserAvatar(validatedInput)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing user avatar:', error)
    throw new Error('Error al reemplazar la imagen de avatar')
  }
}

/**
 * Sube una imagen de workspace a Vercel Blob Storage
 */
export async function uploadWorkspaceImage(input: UploadWorkspaceImageInput) {
  const validatedInput = uploadWorkspaceImageSchema.parse(input)
  
  // Validar que sea un archivo de imagen
  if (!validatedInput.file || !validatedInput.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 2MB para workspaces)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (validatedInput.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 2MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = validatedInput.file.name.split('.').pop() || 'jpg'
    const fileName = `${validatedInput.folder}/${validatedInput.workspaceId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false, // Ya tenemos timestamp para evitar colisiones
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: validatedInput.file.size,
      contentType: validatedInput.file.type
    }
  } catch (error) {
    console.error('Error uploading workspace image:', error)
    throw new Error('Error al subir la imagen del workspace')
  }
}

/**
 * Elimina la imagen anterior de un workspace y sube una nueva
 */
export async function replaceWorkspaceImage(input: UploadWorkspaceImageInput & { currentImageUrl?: string }) {
  const validatedInput = uploadWorkspaceImageSchema.parse(input)
  
  try {
    // Subir nueva imagen
    const newImage = await uploadWorkspaceImage(validatedInput)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous workspace image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing workspace image:', error)
    throw new Error('Error al reemplazar la imagen del workspace')
  }
}

/**
 * Sube un archivo de formulario a Vercel Blob Storage
 */
export async function uploadFormFile(input: UploadFormFileInput) {
  const validatedInput = uploadFormFileSchema.parse(input)
  
  // Validar tipo de archivo
  if (!ALLOWED_FORM_FILE_TYPES.includes(validatedInput.file.type as (typeof ALLOWED_FORM_FILE_TYPES)[number])) {
    throw new Error(`Tipo de archivo no permitido: ${validatedInput.file.type}. Tipos permitidos: ${ALLOWED_FORM_FILE_TYPES.join(', ')}`)
  }
  
  // Validar tamaño (máximo 10MB)
  if (validatedInput.file.size > MAX_FORM_FILE_SIZE) {
    throw new Error(`El archivo no puede ser mayor a ${MAX_FORM_FILE_SIZE / (1024 * 1024)}MB`)
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const safeName = validatedInput.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${validatedInput.folder}/${validatedInput.fieldName}/${timestamp}-${safeName}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false,
    })
    
    return {
      url: blob.url,
      fileName: validatedInput.file.name, // Nombre original
      internalPath: fileName, // Path interno para gestión
      size: validatedInput.file.size,
      contentType: validatedInput.file.type,
      fieldName: validatedInput.fieldName
    }
  } catch (error) {
    console.error('Error uploading form file:', error)
    throw new Error('Error al subir el archivo')
  }
}

/**
 * Sube múltiples archivos de formulario
 */
export async function uploadMultipleFormFiles(files: Array<{ file: File, fieldName: string }>) {
  const uploadPromises = files.map(async ({ file, fieldName }) => {
    return await uploadFormFile({ file, fieldName, folder: 'form-uploads' })
  })
  
  try {
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Error uploading multiple form files:', error)
    throw new Error('Error al subir uno o más archivos')
  }
}

/**
 * Elimina un archivo de formulario de Vercel Blob Storage
 */
export async function deleteFormFile(url: string) {
  try {
    await del(url)
    return { success: true }
  } catch (error) {
    console.error('Error deleting form file:', error)
    throw new Error('Error al eliminar el archivo')
  }
}

/**
 * Valida un archivo antes de la subida (útil para validación del cliente)
 */
export function validateFormFile(file: File): { isValid: boolean, error?: string } {
  // Validar tipo de archivo
  if (!ALLOWED_FORM_FILE_TYPES.includes(file.type as (typeof ALLOWED_FORM_FILE_TYPES)[number])) {
    return {
      isValid: false,
      error: `Tipo de archivo no permitido: ${file.type}`
    }
  }
  
  // Validar tamaño
  if (file.size > MAX_FORM_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo es muy grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Máximo permitido: ${MAX_FORM_FILE_SIZE / (1024 * 1024)}MB`
    }
  }
  
  return { isValid: true }
}

/**
 * Obtiene información de un archivo por su URL
 */
export function getFileInfoFromUrl(url: string) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    
    return {
      fileName,
      isFormFile: pathParts.includes('form-uploads'),
      isAvatar: pathParts.includes('avatars')
    }
  } catch (error) {
    console.error('Error parsing file URL:', error)
    return null
  }
}
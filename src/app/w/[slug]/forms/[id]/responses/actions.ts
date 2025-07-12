"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { updateResponseStatus } from "@/services/form-response-service"
import { redirect } from "next/navigation"

/**
 * Server Action para actualizar el estado de una respuesta
 */
export async function updateResponseStatusAction(
  responseId: string, 
  newStatus: "new" | "reviewed" | "processed"
) {
  try {
    const session = await auth()
    if (!session?.user) {
      redirect("/login")
    }

    // Verificar que el usuario tiene acceso a la respuesta
    // (esto se valida internamente en el service)
    const result = await updateResponseStatus(responseId, newStatus)
    
    if (!result) {
      return {
        success: false,
        message: "Respuesta no encontrada o sin permisos"
      }
    }

    // Revalidar las rutas relacionadas
    revalidatePath(`/w/${result.form.workspace.slug}/forms/${result.form.id}/responses`)
    revalidatePath(`/w/${result.form.workspace.slug}/forms/${result.form.id}/responses/${responseId}`)
    revalidatePath(`/w/${result.form.workspace.slug}/forms/${result.form.id}`)

    return {
      success: true,
      message: "Estado actualizado correctamente"
    }

  } catch (error) {
    console.error("Error updating response status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error interno del servidor"
    }
  }
}
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUsersAction() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("No autorizado")
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            otpTokens: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { success: true, users }
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error obteniendo usuarios" 
    }
  }
}

export async function updateUserRoleAction(userId: string, newRole: "ADMIN" | "CLIENT") {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("No autorizado")
    }

    // No permitir que un admin se quite a sí mismo los permisos de admin
    if (session.user.id === userId && newRole === "CLIENT") {
      throw new Error("No puedes cambiar tu propio rol de administrador")
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Rol de usuario actualizado correctamente" }
  } catch (error) {
    console.error("Error actualizando rol:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando rol" 
    }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("No autorizado")
    }

    // No permitir que un admin se elimine a sí mismo
    if (session.user.id === userId) {
      throw new Error("No puedes eliminar tu propia cuenta")
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Usuario eliminado correctamente" }
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando usuario" 
    }
  }
}

export async function createUserAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("No autorizado")
    }

    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const role = formData.get("role") as "ADMIN" | "CLIENT"

    // Validar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error("Ya existe un usuario con este email")
    }

    // Crear el usuario
    await prisma.user.create({
      data: {
        email,
        name: name || null,
        role
      }
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Usuario creado correctamente" }
  } catch (error) {
    console.error("Error creando usuario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando usuario" 
    }
  }
}
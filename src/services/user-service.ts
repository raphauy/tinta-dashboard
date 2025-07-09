import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Role, type User } from "@prisma/client"

// ✅ Validaciones al inicio del archivo
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nombre requerido").optional(),
  role: z.nativeEnum(Role).default(Role.CLIENT)
})

export const updateUserSchema = createUserSchema.partial()

// Tipos derivados de schemas
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({ 
    where: { id } 
  })
}

/**
 * Obtiene un usuario por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({ 
    where: { email } 
  })
}

/**
 * Obtiene todos los usuarios
 */
export async function getAllUsers(): Promise<User[]> {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const validated = createUserSchema.parse(data)
  return await prisma.user.create({
    data: validated
  })
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const validated = updateUserSchema.parse(data)
  return await prisma.user.update({
    where: { id },
    data: validated
  })
}

/**
 * Elimina un usuario
 */
export async function deleteUser(id: string): Promise<User> {
  return await prisma.user.delete({
    where: { id }
  })
}

/**
 * Obtiene un usuario para autenticación (función específica para auth)
 */
export async function getUserForAuth(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })
}
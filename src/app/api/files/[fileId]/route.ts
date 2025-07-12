import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getUserWorkspaces } from "@/services/workspace-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 })
    }

    const { fileId } = await params

    // Obtener el archivo y verificar que existe
    const file = await prisma.formResponseFile.findUnique({
      where: { id: fileId },
      include: {
        response: {
          include: {
            form: {
              include: {
                workspace: {
                  select: { id: true, slug: true }
                }
              }
            }
          }
        }
      }
    })

    if (!file) {
      return new NextResponse("Archivo no encontrado", { status: 404 })
    }

    // Verificar que el usuario tiene acceso al workspace
    const userWorkspaces = await getUserWorkspaces(session.user.id)
    const hasAccess = userWorkspaces.some(
      uw => uw.workspace.id === file.response.form.workspace.id
    ) || session.user.role === "superadmin"

    if (!hasAccess) {
      return new NextResponse("Sin permisos para acceder a este archivo", { status: 403 })
    }

    // Redirigir al archivo en Vercel Blob
    // En un entorno de producción, podrías implementar streaming del archivo
    // para mayor seguridad, pero por ahora redirigimos al URL público
    return NextResponse.redirect(file.fileUrl)

  } catch (error) {
    console.error("Error downloading file:", error)
    return new NextResponse("Error interno del servidor", { status: 500 })
  }
}
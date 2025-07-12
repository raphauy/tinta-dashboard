import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteImage } from '@/services/upload-service'
import { updateWorkspace, getWorkspaceById, isUserWorkspaceAdmin } from '@/services/workspace-service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { workspaceId, imageUrl } = await request.json()

    if (!workspaceId || !imageUrl) {
      return NextResponse.json({ 
        error: 'ID de workspace y URL de imagen requeridos' 
      }, { status: 400 })
    }

    // Verificar que el workspace existe
    const workspace = await getWorkspaceById(workspaceId)
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace no encontrado' }, { status: 404 })
    }

    // Verificar permisos (superadmin o admin del workspace)
    if (session.user.role !== 'superadmin') {
      const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspaceId)
      if (!isAdmin) {
        return NextResponse.json({ error: 'Sin permisos para editar este workspace' }, { status: 403 })
      }
    }

    // Eliminar imagen del storage
    try {
      await deleteImage({ url: imageUrl })
    } catch (error) {
      // No fallar si no se puede eliminar la imagen del storage
      console.warn('Could not delete image from storage:', error)
    }

    // Actualizar workspace removiendo la imagen
    await updateWorkspace(workspaceId, {
      image: undefined
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing workspace image:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 })
  }
}
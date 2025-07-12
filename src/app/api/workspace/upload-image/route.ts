import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadWorkspaceImage } from '@/services/upload-service'
import { updateWorkspace, getWorkspaceById, isUserWorkspaceAdmin } from '@/services/workspace-service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const workspaceId = formData.get('workspaceId') as string

    if (!file || !workspaceId) {
      return NextResponse.json({ 
        error: 'Archivo y ID de workspace requeridos' 
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

    // Subir imagen
    const uploadResult = await uploadWorkspaceImage({
      file,
      workspaceId,
      folder: 'workspace-images'
    })

    // Actualizar workspace con nueva imagen
    await updateWorkspace(workspaceId, {
      image: uploadResult.url
    })

    return NextResponse.json({
      url: uploadResult.url,
      fileName: uploadResult.fileName,
      size: uploadResult.size
    })

  } catch (error) {
    console.error('Error uploading workspace image:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error interno del servidor' 
    }, { status: 500 })
  }
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, Eye, Link2, Power, PowerOff, Trash, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteFormAction, updateFormStatusAction } from './actions'
import { toast } from 'sonner'
import { type FormWithRelations } from '@/services/form-service'

interface FormActionsClientProps {
  form: FormWithRelations
  workspaceSlug: string
}

export function FormActionsClient({ form, workspaceSlug }: FormActionsClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteFormAction(form.id)
      
      if (result.success) {
        toast.success('Formulario eliminado correctamente')
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error || 'Error al eliminar formulario')
      }
    } catch {
      toast.error('Error al eliminar formulario')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true)
    
    try {
      const result = await updateFormStatusAction(form.id, !form.isActive)
      
      if (result.success) {
        toast.success(`Formulario ${!form.isActive ? 'activado' : 'desactivado'}`)
      } else {
        toast.error(result.error || 'Error al cambiar estado')
      }
    } catch {
      toast.error('Error al cambiar estado')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/f/${form.shareToken}`
    await navigator.clipboard.writeText(publicUrl)
    toast.success('Enlace copiado al portapapeles')
  }

  const canDelete = form._count.responses === 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/w/${workspaceSlug}/forms/${form.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/w/${workspaceSlug}/forms/${form.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/w/${workspaceSlug}/forms/${form.id}/responses`)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver respuestas ({form._count.responses})
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copiar enlace público
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
          >
            {form.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={!canDelete}
            className={!canDelete ? 'opacity-50' : 'text-destructive'}
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar formulario?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El formulario &quot;{form.title2 ? `${form.title} ${form.title2}` : form.title}&quot; será eliminado permanentemente.
              {!canDelete && (
                <span className="block mt-2 text-destructive">
                  No se puede eliminar un formulario que tiene {form._count.responses} respuesta(s).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || !canDelete}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
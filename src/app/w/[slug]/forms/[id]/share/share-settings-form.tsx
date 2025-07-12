'use client'

import { useState } from 'react'
import { RefreshCw, Shield, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { type FormWithRelations } from '@/services/form-service'
import { CopyLinkButton } from '../copy-link-button'
import { 
  regenerateFormTokenAction, 
  updateFormPermissionsAction,
  toggleFormStatusAction 
} from './actions'

interface ShareSettingsFormProps {
  form: FormWithRelations
  workspaceSlug: string
  publicUrl: string
}

export function ShareSettingsForm({ form, workspaceSlug, publicUrl }: ShareSettingsFormProps) {
  const [isActive, setIsActive] = useState(form.isActive)
  const [allowEdits, setAllowEdits] = useState(form.allowEdits)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleStatus = async (checked: boolean) => {
    setIsSaving(true)
    try {
      const result = await toggleFormStatusAction(form.id, checked, workspaceSlug)
      
      if (result.success) {
        setIsActive(checked)
        toast.success(checked ? 'Formulario activado' : 'Formulario desactivado')
      } else {
        toast.error(result.error || 'Error al actualizar estado')
      }
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePermissions = async (checked: boolean) => {
    setIsSaving(true)
    try {
      const result = await updateFormPermissionsAction(form.id, checked, workspaceSlug)
      
      if (result.success) {
        setAllowEdits(checked)
        toast.success('Permisos actualizados')
      } else {
        toast.error(result.error || 'Error al actualizar permisos')
      }
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerateToken = async () => {
    setIsRegenerating(true)
    try {
      const result = await regenerateFormTokenAction(form.id, workspaceSlug)
      
      if (result.success) {
        toast.success('Token regenerado exitosamente. La página se actualizará.')
        setShowRegenerateDialog(false)
        
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        toast.error(result.error || 'Error al regenerar token')
      }
    } catch {
      toast.error('Error inesperado')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configuración del formulario</CardTitle>
          <CardDescription>
            Controla cómo se accede y se completa tu formulario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="form-status" className="text-base font-medium">
                  Estado del formulario
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cuando está desactivado, nadie puede acceder al formulario
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? (
                    <>
                      <Power className="h-3 w-3 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <PowerOff className="h-3 w-3 mr-1" />
                      Inactivo
                    </>
                  )}
                </Badge>
                <Switch
                  id="form-status"
                  checked={isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-edits" className="text-base font-medium">
                    Permitir múltiples envíos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando está activado, el formulario acepta múltiples respuestas. Cuando está desactivado, solo acepta una respuesta en total.
                  </p>
                </div>
                <Switch
                  id="allow-edits"
                  checked={allowEdits}
                  onCheckedChange={handleTogglePermissions}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {isActive && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">{publicUrl}</p>
                </div>
                <CopyLinkButton url={publicUrl} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            Administra la seguridad de tu formulario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Token de seguridad</p>
                <p className="text-sm text-muted-foreground">
                  Regenera el token para invalidar todos los enlaces existentes
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowRegenerateDialog(true)}
                disabled={isRegenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            </div>
            
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Advertencia de seguridad
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Al regenerar el token, todos los enlaces compartidos anteriormente dejarán de funcionar.
                    Los usuarios necesitarán el nuevo enlace para acceder al formulario.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Regenerar token de seguridad?</DialogTitle>
            <DialogDescription>
              Esta acción invalidará todos los enlaces existentes. Los usuarios que tengan
              el enlace anterior ya no podrán acceder al formulario.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegenerateDialog(false)}
              disabled={isRegenerating}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerateToken}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar token
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { updateFormAction } from './actions'
import { toast } from 'sonner'
import { type FormWithRelations } from '@/services/form-service'
import { type FormField } from '@/services/template-service'

interface FormEditFormProps {
  form: FormWithRelations
  workspaceSlug: string
}

export function FormEditForm({ form, workspaceSlug }: FormEditFormProps) {
  const router = useRouter()
  const [name, setName] = useState(form.name)
  const [description, setDescription] = useState(form.description || '')
  const [isActive, setIsActive] = useState(form.isActive)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fields = form.fields as FormField[]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateFormAction(form.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isActive
      })

      if (result.success) {
        toast.success('Formulario actualizado correctamente')
        router.push(`/w/${workspaceSlug}/forms/${form.id}`)
      } else {
        toast.error(result.error || 'Error al actualizar formulario')
      }
    } catch {
      toast.error('Error al actualizar formulario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
          <CardDescription>
            Actualiza el nombre y descripción de tu formulario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del formulario</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del formulario"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de este formulario..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Estado del formulario
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isActive 
                    ? 'El formulario está activo y acepta respuestas'
                    : 'El formulario está inactivo y no acepta respuestas'
                  }
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
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la plantilla</CardTitle>
          <CardDescription>
            Los campos del formulario están basados en la plantilla seleccionada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plantilla base</p>
              <p className="font-medium">{form.template?.name || 'Sin plantilla'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de campos</p>
              <p className="font-medium">{fields.length}</p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-3">Campos incluidos:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{field.label}</span>
                    {field.required && (
                      <Badge variant="outline" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Para modificar los campos, debes crear un nuevo formulario desde una plantilla
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
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
import { updateFormAction, updateFormFieldsAction } from './actions'
import { toast } from 'sonner'
import { type FormWithRelations } from '@/services/form-service'
import { type FormField } from '@/types/form-field'
import { DraggableFormBuilder } from '@/components/form-builder/draggable-form-builder'

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
  const [fields, setFields] = useState<FormField[]>(() => {
    const formFields = form.fields as FormField[] || []
    // Asegurar que todos los campos tienen IDs únicos
    return formFields.map((field, index) => ({
      ...field,
      id: field.id || `field-${Date.now()}-${index}`,
      order: field.order ?? index
    }))
  })
  const [isFieldsSubmitting, setIsFieldsSubmitting] = useState(false)

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

  const handleSaveFields = async () => {
    if (fields.length === 0) {
      toast.error('Debe haber al menos un campo')
      return
    }

    const invalidFields = fields.filter(field => !field.label.trim())
    if (invalidFields.length > 0) {
      toast.error('Todos los campos deben tener una etiqueta')
      return
    }

    setIsFieldsSubmitting(true)

    try {
      const result = await updateFormFieldsAction(form.id, fields)

      if (result.success) {
        toast.success('Campos actualizados correctamente')
      } else {
        toast.error(result.error || 'Error al actualizar campos')
      }
    } catch {
      toast.error('Error al actualizar campos')
    } finally {
      setIsFieldsSubmitting(false)
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

      <div className="space-y-4">
        <DraggableFormBuilder
          fields={fields}
          onFieldsChange={setFields}
          title="Campos del Formulario"
          description="Arrastra los campos para reordenarlos. Edita cada campo haciendo clic para expandir."
          emptyTitle="Agrega campos para estructurar tu formulario"
          emptyDescription="Este formulario no tiene campos aún"
        />
        
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={handleSaveFields}
            disabled={isFieldsSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isFieldsSubmitting ? 'Guardando campos...' : 'Guardar campos'}
          </Button>
        </div>
      </div>

      {form.template && (
        <Card>
          <CardHeader>
            <CardTitle>Información de la plantilla original</CardTitle>
            <CardDescription>
              Este formulario fue creado basándose en una plantilla
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plantilla base</p>
                <p className="font-medium">{form.template.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campos actuales</p>
                <p className="font-medium">{fields.length}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Los campos pueden ser modificados independientemente de la plantilla original
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
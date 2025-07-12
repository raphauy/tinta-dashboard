'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createTemplateAction, updateTemplateAction } from './actions'
import { type TemplateWithCreator } from '@/services/template-service'
import { type FormField } from '@/types/form-field'
import { DraggableFormBuilder } from '@/components/form-builder/draggable-form-builder'

interface TemplateFormProps {
  template?: TemplateWithCreator
}

export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [fields, setFields] = useState<FormField[]>(() => {
    const templateFields = template?.fields as FormField[] || []
    // Asegurar que todos los campos tienen IDs únicos
    return templateFields.map((field, index) => ({
      ...field,
      id: field.id || `field-${Date.now()}-${index}`,
      order: field.order ?? index
    }))
  })


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre de la plantilla es requerido')
      return
    }

    if (fields.length === 0) {
      toast.error('Debes agregar al menos un campo')
      return
    }

    const invalidFields = fields.filter(field => !field.label.trim())
    if (invalidFields.length > 0) {
      toast.error('Todos los campos deben tener una etiqueta')
      return
    }

    setIsSubmitting(true)

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        fields
      }

      let result
      if (template) {
        result = await updateTemplateAction(template.id, data)
      } else {
        result = await createTemplateAction({ ...data, createdById: '' })
      }

      if (result.success) {
        toast.success(template ? 'Plantilla actualizada' : 'Plantilla creada correctamente')
        router.push('/admin/templates')
      } else {
        toast.error(result.error || 'Error al guardar plantilla')
      }
    } catch {
      toast.error('Error al guardar plantilla')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la plantilla</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Brief de Diseño"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe para qué se usa esta plantilla"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <DraggableFormBuilder 
        fields={fields} 
        onFieldsChange={setFields}
        title="Campos de la Plantilla"
        emptyTitle="Agrega campos para estructurar tu plantilla"
        emptyDescription="Esta plantilla no tiene campos aún"
      />

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/templates')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (template ? 'Actualizando...' : 'Creando...') 
            : (template ? 'Actualizar plantilla' : 'Crear plantilla')
          }
        </Button>
      </div>
    </form>
  )
}
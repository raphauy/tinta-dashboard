'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createTemplateAction, updateTemplateAction } from './actions'
import { type FormField, type TemplateWithCreator } from '@/services/template-service'

interface TemplateFormProps {
  template?: TemplateWithCreator
}

export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [fields, setFields] = useState<FormField[]>(
    template?.fields as FormField[] || []
  )

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: '',
      helpText: '',
      required: false,
      order: fields.length
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...updates }
    setFields(updatedFields)
  }

  const removeField = (index: number) => {
    const filteredFields = fields.filter((_, i) => i !== index)
    // Reordenar los campos restantes
    const reorderedFields = filteredFields.map((field, i) => ({
      ...field,
      order: i
    }))
    setFields(reorderedFields)
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return
    }

    const newFields = [...fields]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Intercambiar campos
    ;[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]]
    
    // Actualizar orden
    newFields[index].order = index
    newFields[targetIndex].order = targetIndex
    
    setFields(newFields)
  }

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

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campos del formulario</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            disabled={isSubmitting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar campo
          </Button>
        </div>

        {fields.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No hay campos aún. Agrega campos para construir tu plantilla.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={addField}
                disabled={isSubmitting}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar primer campo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-base">Campo {index + 1}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(index, 'up')}
                        disabled={index === 0 || isSubmitting}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(index, 'down')}
                        disabled={index === fields.length - 1 || isSubmitting}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Tipo de campo</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as 'text' | 'textarea' | 'file' })}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto corto</SelectItem>
                          <SelectItem value="textarea">Texto largo</SelectItem>
                          <SelectItem value="file">Archivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Etiqueta del campo</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Ej: Nombre de la empresa"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Texto de ayuda (opcional)</Label>
                    <Input
                      value={field.helpText || ''}
                      onChange={(e) => updateField(index, { helpText: e.target.value })}
                      placeholder="Ej: Ingrese el nombre completo de su empresa"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      disabled={isSubmitting}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`required-${field.id}`} className="cursor-pointer">
                      Campo requerido
                    </Label>
                  </div>

                  {field.type === 'file' && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <p className="font-medium mb-1">Configuración de archivos:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Tipos permitidos: PDF, Word, imágenes (JPG, PNG), ZIP</li>
                        <li>• Tamaño máximo: 10MB por archivo</li>
                        <li>• Múltiples archivos: Sí</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
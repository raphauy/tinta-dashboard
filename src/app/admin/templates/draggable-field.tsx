'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type FormField } from '@/services/template-service'

interface DraggableFieldProps {
  field: FormField
  index: number
  isExpanded: boolean
  isNewlyCreated?: boolean
  isMarkedForDeletion?: boolean
  onToggleExpand: (fieldId: string) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onDeleteField: (fieldId: string) => void
}

export function DraggableField({
  field,
  index,
  isExpanded,
  isNewlyCreated,
  isMarkedForDeletion,
  onToggleExpand,
  onUpdateField,
  onDeleteField
}: DraggableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const fieldTypes = [
    { value: 'text', label: 'Texto corto' },
    { value: 'textarea', label: 'Texto largo' },
    { value: 'file', label: 'Archivo' },
  ]

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`transition-all ${isDragging ? 'opacity-50 shadow-lg' : ''} ${isNewlyCreated ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${isMarkedForDeletion ? 'opacity-60 bg-red-50 border-red-200' : ''}`}
      data-field-id={field.id}
      {...attributes}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {field.label || `Campo ${index + 1}`}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  field.type === 'text' ? 'bg-blue-100 text-blue-800' :
                  field.type === 'textarea' ? 'bg-green-100 text-green-800' :
                  field.type === 'file' ? 'bg-purple-100 text-purple-800' :
                  ''
                }`}
              >
                {field.type === 'text' && 'Texto'}
                {field.type === 'textarea' && 'Texto largo'}
                {field.type === 'file' && 'Archivo'}
              </Badge>
              {field.required && (
                <Badge variant="outline" className="text-xs">
                  Requerido
                </Badge>
              )}
              {isMarkedForDeletion && (
                <Badge variant="destructive" className="text-xs">
                  Marcado para eliminar
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(field.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDeleteField(field.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && !isMarkedForDeletion && (
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`field-type-${field.id}`}>Tipo de campo</Label>
              <Select 
                value={field.type} 
                onValueChange={(value) => onUpdateField(field.id, { type: value as FormField['type'] })}
              >
                <SelectTrigger id={`field-type-${field.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`field-label-${field.id}`}>Etiqueta del campo</Label>
              <Input
                id={`field-label-${field.id}`}
                value={field.label}
                onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                onFocus={(e) => {
                  // Clear generic "Campo X" text when focusing
                  if (field.label.match(/^Campo \d+$/)) {
                    e.target.select()
                  }
                }}
                placeholder="Nombre del campo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`field-help-${field.id}`}>Texto de ayuda (opcional)</Label>
            <Textarea
              id={`field-help-${field.id}`}
              value={field.helpText || ''}
              onChange={(e) => onUpdateField(field.id, { helpText: e.target.value })}
              placeholder="Instrucciones adicionales para el usuario"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdateField(field.id, { required: Boolean(checked) })}
            />
            <Label 
              htmlFor={`field-required-${field.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Campo requerido
            </Label>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
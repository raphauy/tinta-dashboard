'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DraggableField } from './draggable-field'
import { type FormField } from '@/types/form-field'

interface DraggableFormBuilderProps {
  fields: FormField[]
  onFieldsChange: (fields: FormField[]) => void
  title?: string
  description?: string
  emptyTitle?: string
  emptyDescription?: string
  addButtonText?: string
}

export function DraggableFormBuilder({ 
  fields, 
  onFieldsChange,
  title = "Campos del Formulario",
  description = "Arrastra los campos para reordenarlos. Haz clic para expandir y editar.",
  emptyTitle = "Agrega campos para estructurar tu formulario",
  emptyDescription = "Este formulario no tiene campos aún",
  addButtonText = "Agregar campo"
}: DraggableFormBuilderProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
  const [newlyCreatedField, setNewlyCreatedField] = useState<string | null>(null)
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id)
      const newIndex = fields.findIndex((field) => field.id === over.id)

      const reorderedFields = arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index
      }))

      onFieldsChange(reorderedFields)
    }
  }

  const handleToggleExpand = (fieldId: string) => {
    const newExpanded = new Set(expandedFields)
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId)
    } else {
      newExpanded.add(fieldId)
    }
    setExpandedFields(newExpanded)
  }

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onFieldsChange(updatedFields)
  }

  const handleDeleteField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    const fieldLabel = field?.label || 'Campo'
    
    // Mark field for deletion
    const newMarkedForDeletion = new Set(markedForDeletion)
    newMarkedForDeletion.add(fieldId)
    setMarkedForDeletion(newMarkedForDeletion)
    
    // Update parent with filtered fields
    const activeFields = fields.filter(field => !newMarkedForDeletion.has(field.id))
    onFieldsChange(activeFields)
    
    // Collapse the field
    const newExpanded = new Set(expandedFields)
    newExpanded.delete(fieldId)
    setExpandedFields(newExpanded)
    
    // Show toast with undo option
    toast(`Campo "${fieldLabel}" marcado para eliminar`, {
      action: {
        label: 'Deshacer',
        onClick: () => handleUndoDelete(fieldId)
      },
      duration: 5000
    })
  }
  
  const handleUndoDelete = (fieldId: string) => {
    const newMarkedForDeletion = new Set(markedForDeletion)
    newMarkedForDeletion.delete(fieldId)
    setMarkedForDeletion(newMarkedForDeletion)
    
    // Update parent with restored fields
    const activeFields = fields.filter(field => !newMarkedForDeletion.has(field.id))
    onFieldsChange(activeFields)
    
    toast.dismiss()
    toast.success('Campo restaurado')
  }

  const handleAddField = (type: FormField['type'] = 'text', insertAtIndex?: number) => {
    const targetIndex = insertAtIndex ?? fields.length
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: `Campo ${fields.length + 1}`,
      helpText: '',
      required: false,
      order: targetIndex,
      properties: {}
    }

    // Insert field at the specified position
    const newFields = [...fields]
    newFields.splice(targetIndex, 0, newField)
    
    // Update orders for all fields
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index
    }))

    onFieldsChange(reorderedFields)
    
    // Expand the new field and mark as newly created
    const newExpanded = new Set(expandedFields)
    newExpanded.add(newField.id)
    setExpandedFields(newExpanded)
    setNewlyCreatedField(newField.id)
  }

  // Auto-scroll to newly created field
  useEffect(() => {
    if (newlyCreatedField && containerRef.current) {
      const fieldElement = containerRef.current.querySelector(`[data-field-id="${newlyCreatedField}"]`)
      if (fieldElement) {
        fieldElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        
        // Focus on the label input after a short delay
        setTimeout(() => {
          const labelInput = fieldElement.querySelector('input[placeholder*="Nombre del campo"]') as HTMLInputElement
          if (labelInput) {
            labelInput.focus()
            labelInput.select()
          }
        }, 500)
      }
      
      // Clear the newly created field marker after animation
      setTimeout(() => setNewlyCreatedField(null), 1000)
    }
  }, [newlyCreatedField])

  if (fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {emptyTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              {emptyDescription}
            </p>
            <Button type="button" onClick={() => handleAddField()}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar primer campo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <Button type="button" onClick={() => handleAddField()} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        </div>
      </CardHeader>
      <CardContent ref={containerRef}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <DraggableField
                    key={field.id}
                    field={field}
                    index={index}
                    isExpanded={expandedFields.has(field.id)}
                    isNewlyCreated={newlyCreatedField === field.id}
                    isMarkedForDeletion={markedForDeletion.has(field.id)}
                    onToggleExpand={handleToggleExpand}
                    onUpdateField={handleUpdateField}
                    onDeleteField={handleDeleteField}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}
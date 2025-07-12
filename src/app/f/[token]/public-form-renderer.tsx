'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { type FormField } from '@/types/form-field'
import { type FormWithWorkspaceUsers } from '@/services/form-service'
import { TextFieldRenderer } from './text-field-renderer'
import { TextareaFieldRenderer } from './textarea-field-renderer'
import { submitFormResponse } from './actions'

interface PublicFormRendererProps {
  form: FormWithWorkspaceUsers
}

export function PublicFormRenderer({ form }: PublicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const fields = form.fields as FormField[]
  const sortedFields = fields.sort((a, b) => a.order - b.order)

  // Calcular progreso
  const requiredFields = sortedFields.filter(field => field.required)
  const completedRequiredFields = requiredFields.filter(field => {
    const value = formData[field.id]
    return value !== undefined && value !== null && value !== ''
  })
  const progress = requiredFields.length > 0 
    ? (completedRequiredFields.length / requiredFields.length) * 100 
    : 100

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Limpiar error si existe
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const handleAttachmentsChange = (fieldId: string, files: File[]) => {
    setAttachments(prev => ({
      ...prev,
      [fieldId]: files
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    sortedFields.forEach(field => {
      if (field.required) {
        const value = formData[field.id]
        const fieldAttachments = attachments[field.id] || []
        
        // Validar campo principal
        if (!value || value === '') {
          newErrors[field.id] = `${field.label} es obligatorio`
        }
        
        // Si el campo permite adjuntos y están marcados como requeridos
        if (field.allowAttachments && field.required && fieldAttachments.length === 0) {
          // Por ahora no requerimos adjuntos obligatorios
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Combinar datos del formulario con archivos adjuntos
      const dataWithAttachments = { ...formData }
      
      // Agregar archivos a los datos del formulario
      Object.entries(attachments).forEach(([fieldId, files]) => {
        if (files.length > 0) {
          dataWithAttachments[fieldId] = files
        }
      })
      
      const result = await submitFormResponse(form.shareToken, dataWithAttachments)
      
      if (result.success) {
        setIsSubmitted(true)
        toast.success(result.message)
      } else {
        toast.error(result.message || 'Error al enviar el formulario')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al enviar el formulario. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.id]

    switch (field.type) {
      case 'text':
        return (
          <TextFieldRenderer
            key={field.id}
            field={field}
            value={typeof fieldValue === 'string' ? fieldValue : ''}
            onChange={(value: string) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
            attachments={attachments[field.id]}
            onAttachmentsChange={(files: File[]) => handleAttachmentsChange(field.id, files)}
          />
        )
      case 'textarea':
        return (
          <TextareaFieldRenderer
            key={field.id}
            field={field}
            value={typeof fieldValue === 'string' ? fieldValue : ''}
            onChange={(value: string) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
            attachments={attachments[field.id]}
            onAttachmentsChange={(files: File[]) => handleAttachmentsChange(field.id, files)}
          />
        )
      default:
        return null
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">¡Formulario Enviado!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Gracias por completar el formulario. Hemos recibido tu información y nos pondremos en contacto contigo pronto.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Cliente:</strong> {form.workspace.name}<br />
              <strong>Formulario:</strong> {form.name}<br />
              <strong>Enviado:</strong> {new Date().toLocaleString('es-ES')}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Si tienes alguna pregunta, contáctanos en{" "}
            <a href="mailto:contacto@tinta.wine" className="text-primary hover:underline">
              contacto@tinta.wine
            </a>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de progreso sticky */}
      {requiredFields.length > 0 && (
        <div className="sticky top-4 z-10 mb-6">
          <Card className="shadow-lg border-2 bg-background/95 backdrop-blur-sm">
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-sm font-medium hidden sm:inline">Progreso:</span>
                  <span className="text-sm font-medium sm:hidden">📊</span>
                  <Progress value={progress} className="h-2 w-24 sm:w-32" />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {completedRequiredFields.length}/{requiredFields.length}
                  <span className="hidden sm:inline"> obligatorios</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {sortedFields.map(renderField)}
        
        <Card>
          <CardContent className="pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { type FormField } from '@/types/form-field'
import { type FormWithWorkspaceUsers } from '@/services/form-service'
import { PdfStyleFieldRenderer } from './pdf-style-field-renderer'
import { submitFormResponse } from './actions'

interface PdfStyleFormRendererProps {
  form: FormWithWorkspaceUsers
}

export function PdfStyleFormRenderer({ form }: PdfStyleFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const fields = form.fields as FormField[]
  const sortedFields = fields.sort((a, b) => a.order - b.order)

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
        
        // Validar campo principal
        if (!value || value === '') {
          newErrors[field.id] = `Este campo es obligatorio`
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
      
      // Agregar archivos a los datos del formulario usando una clave especial
      Object.entries(attachments).forEach(([fieldId, files]) => {
        if (files.length > 0) {
          // Usar una clave especial para archivos, preservando el texto original
          dataWithAttachments[`${fieldId}_files`] = files
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

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-stone-700 dark:text-gray-700 mb-4">
            ¡Formulario Enviado!
          </h2>
          <p className="text-stone-600 dark:text-gray-600 mb-6">
            Gracias por completar el formulario. Hemos recibido tu información y nos pondremos en contacto contigo pronto.
          </p>
        </div>
        
        <div className="p-6 bg-stone-50 dark:bg-gray-100 rounded-lg border border-stone-200 mb-6">
          <div className="text-sm text-stone-600 dark:text-gray-700 space-y-1">
            <p><span className="font-medium">Cliente:</span> {form.workspace.name}</p>
            <p><span className="font-medium">Formulario:</span> {form.title2 ? `${form.title} ${form.title2}` : form.title}</p>
            <p><span className="font-medium">Enviado:</span> {new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
        
        <p className="text-xs text-stone-500 dark:text-gray-600">
          Si tienes alguna pregunta, contáctanos en{" "}
          <a href="mailto:contacto@tinta.wine" className="text-tinta-verde-uva hover:underline">
            contacto@tinta.wine
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {sortedFields.map((field, index) => (
          <PdfStyleFieldRenderer
            key={field.id}
            field={field}
            fieldIndex={index + 1}
            value={typeof formData[field.id] === 'string' ? formData[field.id] as string : ''}
            onChange={(value: string) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
            attachments={attachments[field.id]}
            onAttachmentsChange={(files: File[]) => handleAttachmentsChange(field.id, files)}
          />
        ))}
        
        {/* Botón de envío */}
        <div className="pt-8">
          <Button 
            type="submit" 
            className="w-full bg-tinta-verde-uva hover:bg-tinta-verde-uva/90 text-white font-light text-lg py-3 h-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
          </Button>
        </div>
      </form>
    </div>
  )
}
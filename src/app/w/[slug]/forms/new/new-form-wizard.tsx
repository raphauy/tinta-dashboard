'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateSelector } from '../template-selector'
import { TemplatePreview } from '../template-preview'
import { createFormFromTemplateAction } from '../actions'
import { toast } from 'sonner'
import { type TemplateWithStats } from '@/services/template-service'
import { type FormField } from '@/types/form-field'

interface NewFormWizardProps {
  workspaceSlug: string
  templates: TemplateWithStats[]
}

type Step = 'template' | 'details' | 'preview'

export function NewFormWizard({ workspaceSlug, templates }: NewFormWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithStats | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTemplateSelect = (template: TemplateWithStats) => {
    setSelectedTemplate(template)
    // Auto-populate form name based on template
    if (!formName) {
      setFormName(`Formulario - ${template.name}`)
    }
  }

  const handleUseTemplate = (template: TemplateWithStats) => {
    setSelectedTemplate(template)
    // Auto-populate form name based on template
    if (!formName) {
      setFormName(`Formulario - ${template.name}`)
    }
    // Avanzar automáticamente al siguiente paso
    setStep('details')
  }

  const handleNext = () => {
    if (step === 'template' && selectedTemplate) {
      setStep('details')
    } else if (step === 'details' && formName.trim()) {
      setStep('preview')
    }
  }

  const handleBack = () => {
    if (step === 'details') {
      setStep('template')
    } else if (step === 'preview') {
      setStep('details')
    }
  }

  const handleSubmit = async () => {
    if (!selectedTemplate || !formName.trim()) {
      toast.error('Faltan datos requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      await createFormFromTemplateAction({
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        workspaceSlug,
        templateId: selectedTemplate.id,
        fields: selectedTemplate.fields as FormField[]
      })
      
      // Si llegamos aquí, significa que hubo un error (ya que el redirect exitoso no retorna)
      toast.error('Error al crear formulario')
    } catch (error) {
      // Si es un error de redirect exitoso, no hacer nada (Next.js manejará el redirect)
      if (error && typeof error === 'object' && 'digest' in error && String(error.digest).includes('NEXT_REDIRECT')) {
        // Este es el comportamiento esperado para un redirect exitoso
        return
      }
      
      // Si es cualquier otro error, mostrarlo
      toast.error('Error al crear formulario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className={`flex flex-col items-center space-y-2 flex-1 ${
          step === 'template' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            step === 'template' ? 'border-primary bg-primary text-primary-foreground' :
            ['details', 'preview'].includes(step) ? 'border-primary bg-primary text-primary-foreground' :
            'border-muted-foreground'
          }`}>
            {['details', 'preview'].includes(step) ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <span className="text-xs font-medium text-center whitespace-nowrap">Plantilla</span>
        </div>
        
        <div className="flex-shrink-0 w-8 h-px bg-border mx-2 mt-[-16px]" />
        
        <div className={`flex flex-col items-center space-y-2 flex-1 ${
          step === 'details' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            step === 'details' ? 'border-primary bg-primary text-primary-foreground' :
            step === 'preview' ? 'border-primary bg-primary text-primary-foreground' :
            'border-muted-foreground'
          }`}>
            {step === 'preview' ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <span className="text-xs font-medium text-center whitespace-nowrap">Detalles</span>
        </div>
        
        <div className="flex-shrink-0 w-8 h-px bg-border mx-2 mt-[-16px]" />
        
        <div className={`flex flex-col items-center space-y-2 flex-1 ${
          step === 'preview' ? 'text-primary' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
            step === 'preview' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
          }`}>
            3
          </div>
          <span className="text-xs font-medium text-center whitespace-nowrap">Confirmar</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle>Selecciona una plantilla</CardTitle>
            <CardDescription>
              Elige la plantilla que mejor se adapte a tus necesidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateSelector
              templates={templates}
              onSelectTemplate={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
              onUseTemplate={handleUseTemplate}
            />
          </CardContent>
        </Card>
      )}

      {step === 'details' && selectedTemplate && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del formulario</CardTitle>
              <CardDescription>
                Personaliza el nombre y descripción de tu formulario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Nombre del formulario</Label>
                <Input
                  id="form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Brief de Diseño - Cliente ABC"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-description">Descripción (opcional)</Label>
                <Textarea
                  id="form-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe el propósito de este formulario..."
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>Basado en plantilla:</span>
                  <Badge variant="outline">{selectedTemplate.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(selectedTemplate.fields as FormField[]).length} campos incluidos
                </p>
              </div>
            </CardContent>
          </Card>

          <TemplatePreview template={selectedTemplate} formName={formName.trim() || undefined} />
        </div>
      )}

      {step === 'preview' && selectedTemplate && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirmar creación</CardTitle>
              <CardDescription>
                Revisa los detalles antes de crear tu formulario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="font-medium">{formName}</p>
                </div>
                {formDescription && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                    <p className="text-sm">{formDescription}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Plantilla base</Label>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Campos</Label>
                  <p className="font-medium">{(selectedTemplate.fields as FormField[]).length} campos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TemplatePreview template={selectedTemplate} formName={formName.trim() || undefined} />
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={step === 'template' ? () => router.back() : handleBack}
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 'template' ? 'Cancelar' : 'Anterior'}
        </Button>

        {step === 'preview' ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear formulario'}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={
              (step === 'template' && !selectedTemplate) ||
              (step === 'details' && !formName.trim())
            }
          >
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
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
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TemplateSelector } from '../template-selector'
import { TemplatePreview } from '../template-preview'
import { createFormFromTemplateAction } from '../actions'
import { toast } from 'sonner'
import { type TemplateWithStats } from '@/services/template-service'
import { type FormField } from '@/types/form-field'
import { tintaColorOptions, getTintaColor } from '@/lib/tinta-colors'

interface NewFormWizardProps {
  workspaceSlug: string
  templates: TemplateWithStats[]
}

type Step = 'template' | 'details' | 'preview'

export function NewFormWizard({ workspaceSlug, templates }: NewFormWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithStats | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formTitle2, setFormTitle2] = useState('')
  const [formColor, setFormColor] = useState('')
  const [formSubtitle, setFormSubtitle] = useState('')
  const [projectName, setProjectName] = useState('')
  const [client, setClient] = useState('')
  const [allowEdits, setAllowEdits] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTemplateSelect = (template: TemplateWithStats) => {
    setSelectedTemplate(template)
    // Auto-populate form title based on template
    if (!formTitle) {
      setFormTitle(`Formulario - ${template.name}`)
    }
  }

  const handleUseTemplate = (template: TemplateWithStats) => {
    setSelectedTemplate(template)
    // Auto-populate form title based on template
    if (!formTitle) {
      setFormTitle(`Formulario - ${template.name}`)
    }
    // Avanzar automáticamente al siguiente paso
    setStep('details')
  }

  const handleNext = () => {
    if (step === 'template' && selectedTemplate) {
      setStep('details')
    } else if (step === 'details' && formTitle.trim()) {
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
    if (!selectedTemplate || !formTitle.trim()) {
      toast.error('Faltan datos requeridos')
      return
    }

    setIsSubmitting(true)

    try {
      await createFormFromTemplateAction({
        title: formTitle.trim(),
        title2: formTitle2.trim() || undefined,
        color: formColor || undefined,
        subtitle: formSubtitle.trim() || undefined,
        projectName: projectName.trim() || undefined,
        client: client.trim() || undefined,
        allowEdits,
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="form-name">Título del formulario</Label>
                  <Input
                    id="form-name"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Brief"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-title2">Segunda línea del título (opcional)</Label>
                  <Input
                    id="form-title2"
                    value={formTitle2}
                    onChange={(e) => setFormTitle2(e.target.value)}
                    placeholder="de Diseño"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-color">Color del círculo (opcional)</Label>
                <Select value={formColor || "none"} onValueChange={(value) => setFormColor(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un color">
                      {formColor ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: getTintaColor(formColor) }}
                          />
                          {tintaColorOptions.find(opt => opt.value === formColor)?.label}
                        </div>
                      ) : (
                        "Sin color"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin color</SelectItem>
                    {tintaColorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: option.color }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Solo aparece si hay segunda línea del título
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form-description">Subtítulo (opcional)</Label>
                <Textarea
                  id="form-description"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Describe el propósito de este formulario..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Nombre del Proyecto (opcional)</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej: Campaña 2025"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente (opcional)</Label>
                  <Input
                    id="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Ej: Bodega XYZ"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Label htmlFor="allow-edits" className="text-sm font-medium">
                      Múltiples envíos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {allowEdits 
                        ? 'Permite múltiples respuestas del mismo cliente'
                        : 'Solo permite una respuesta por cliente'
                      }
                    </p>
                  </div>
                  <Switch
                    id="allow-edits"
                    checked={allowEdits}
                    onCheckedChange={setAllowEdits}
                  />
                </div>
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

          <TemplatePreview template={selectedTemplate} formName={formTitle.trim() || undefined} />
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
                  <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                  <div className="space-y-1">
                    <p className="font-medium">{formTitle}</p>
                    {formTitle2 && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Segunda línea: {formTitle2}</p>
                        {formColor && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full border" 
                              style={{ backgroundColor: getTintaColor(formColor) }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {tintaColorOptions.find(opt => opt.value === formColor)?.label}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {formSubtitle && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subtítulo</Label>
                    <p className="text-sm">{formSubtitle}</p>
                  </div>
                )}
                {projectName && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Proyecto</Label>
                    <p className="text-sm">{projectName}</p>
                  </div>
                )}
                {client && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                    <p className="text-sm">{client}</p>
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
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Múltiples envíos</Label>
                  <p className="font-medium">{allowEdits ? 'Permitidos' : 'No permitidos'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TemplatePreview template={selectedTemplate} formName={formTitle.trim() || undefined} />
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
              (step === 'details' && !formTitle.trim())
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
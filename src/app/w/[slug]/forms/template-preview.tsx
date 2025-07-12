'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Eye, EyeOff } from 'lucide-react'
import { type TemplateWithStats } from '@/services/template-service'
import { type FormField } from '@/types/form-field'
import { useState } from 'react'

interface TemplatePreviewProps {
  template: TemplateWithStats
  className?: string
  formName?: string
}

export function TemplatePreview({ template, className = '', formName }: TemplatePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const fields = template.fields as FormField[]

  const renderFieldPreview = (field: FormField) => {
    const baseId = `preview-${field.id}`
    
    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={baseId} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        
        {field.type === 'text' && (
          <Input
            id={baseId}
            placeholder={`Ingrese ${field.label.toLowerCase()}`}
            disabled
            className="bg-muted/50"
          />
        )}
        
        {field.type === 'textarea' && (
          <Textarea
            id={baseId}
            placeholder={`Ingrese ${field.label.toLowerCase()}`}
            rows={3}
            disabled
            className="bg-muted/50"
          />
        )}
        
        {field.allowAttachments && (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 bg-pink-50/50">
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-pink-400" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Este campo permite archivos adjuntos
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Word, imágenes, ZIP (máx. 10MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vista previa: {formName || template.name}
            </CardTitle>
            <CardDescription>
              {formName 
                ? "Así se verá tu formulario una vez creado"
                : "Así se verá el formulario basado en esta plantilla"
              }
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Ver preview
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {showPreview && (
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{fields.length} campo{fields.length !== 1 ? 's' : ''}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {fields.filter(f => f.required).length} requerido{fields.filter(f => f.required).length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="space-y-6">
            {fields
              .sort((a, b) => a.order - b.order)
              .map(renderFieldPreview)
            }
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-3">
              <Button disabled className="bg-muted/50">
                Enviar formulario
              </Button>
              <Button variant="outline" disabled className="bg-muted/50">
                Guardar borrador
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Vista previa - Los campos están deshabilitados
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
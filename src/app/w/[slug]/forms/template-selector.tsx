'use client'

import { useState } from 'react'
import { Search, FileText, ChevronRight, User, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type TemplateWithStats, type FormField } from '@/services/template-service'

interface TemplateSelectorProps {
  templates: TemplateWithStats[]
  onSelectTemplate: (template: TemplateWithStats) => void
  selectedTemplateId?: string
  onUseTemplate?: (template: TemplateWithStats) => void
}

export function TemplateSelector({ 
  templates, 
  onSelectTemplate, 
  selectedTemplateId,
  onUseTemplate
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (template.fields as FormField[]).some(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay plantillas disponibles</h3>
          <p className="text-sm text-muted-foreground text-center">
            Contacta a un administrador para que cree plantillas de formulario
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar plantillas por nombre, descripción o campos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              No se encontraron plantillas que coincidan con &quot;{searchTerm}&quot;
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id
            const fields = template.fields as FormField[]
            
            return (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => onSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-2 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <ChevronRight className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{fields.length} campo{fields.length !== 1 ? 's' : ''}</span>
                    </div>
                    {template._count.forms > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {template._count.forms} uso{template._count.forms !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="text-xs">
                        Creado por {template.createdBy.name || template.createdBy.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">
                        {new Date(template.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-2">Campos incluidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {fields.slice(0, 3).map((field, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {field.label}
                        </Badge>
                      ))}
                      {fields.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{fields.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onUseTemplate) {
                            onUseTemplate(template)
                          } else {
                            onSelectTemplate(template)
                          }
                        }}
                      >
                        Usar esta plantilla
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
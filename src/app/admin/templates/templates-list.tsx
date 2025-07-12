import { getTemplates } from "@/services/template-service"
import { type FormField } from "@/types/form-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TemplateActionsClient } from "./template-actions-client"
import { FileText, Clock, User } from "lucide-react"
import Link from "next/link"

export async function TemplatesList() {
  const templates = await getTemplates()

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay plantillas aún</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Comienza creando tu primera plantilla de formulario
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  <Link 
                    href={`/admin/templates/${template.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {template.name}
                  </Link>
                </CardTitle>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </div>
              <TemplateActionsClient template={template} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{(template.fields as FormField[]).length} campos</span>
              </div>
              {template._count.forms > 0 && (
                <Badge variant="secondary">
                  {template._count.forms} formulario{template._count.forms !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Creado por {template.createdBy.name || template.createdBy.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{new Date(template.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-2">Campos incluidos:</p>
              <div className="flex flex-wrap gap-1">
                {(template.fields as FormField[]).slice(0, 3).map((field, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {field.label}
                  </Badge>
                ))}
                {(template.fields as FormField[]).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(template.fields as FormField[]).length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
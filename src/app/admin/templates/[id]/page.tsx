import { notFound } from "next/navigation"
import Link from "next/link"
import { getTemplateById } from "@/services/template-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, FileText, User, Clock, Hash } from "lucide-react"
import { type FormField } from "@/types/form-field"

interface TemplateDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params
  const template = await getTemplateById(id)

  if (!template) {
    notFound()
  }

  const fields = template.fields as FormField[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
            {template.description && (
              <p className="text-muted-foreground">{template.description}</p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/templates/${template.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar plantilla
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ID:</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{template.id}</code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Campos:</span>
              <span className="font-medium">{fields.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Creado por:</span>
              <span className="font-medium">{template.createdBy.name || template.createdBy.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fecha de creación:</span>
              <span className="font-medium">
                {new Date(template.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold mb-2">0</div>
              <p className="text-sm text-muted-foreground">
                Formularios creados con esta plantilla
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campos del Formulario</CardTitle>
          <CardDescription>
            Estructura y configuración de los campos de esta plantilla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id}>
                <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Campo {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {field.type === 'text' && 'Texto corto'}
                          {field.type === 'textarea' && 'Texto largo'}
                        </Badge>
                        {field.allowAttachments && (
                          <Badge variant="outline" className="text-xs bg-pink-50 text-pink-600 border-pink-200">
                            Con adjuntos
                          </Badge>
                        )}
                      </div>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">
                          Requerido
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{field.label}</p>
                      {field.helpText && (
                        <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
                      )}
                    </div>
                    {field.allowAttachments && (
                      <div className="mt-2 p-2 bg-pink-50 border border-pink-200 rounded text-xs space-y-1">
                        <p className="font-medium text-pink-800">Permite archivos adjuntos:</p>
                        <ul className="text-pink-700 space-y-0.5">
                          <li>• Tipos: PDF, Word, imágenes, ZIP</li>
                          <li>• Tamaño máximo: 10MB</li>
                          <li>• Múltiples archivos permitidos</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {index < fields.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
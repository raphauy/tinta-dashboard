import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Power, PowerOff, BarChart3, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getFormById } from '@/services/form-service'
import { type FormField } from '@/types/form-field'
import { CopyLinkButton } from './copy-link-button'

interface FormDetailPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

function FormDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function FormDetailContent({ workspaceSlug, formId }: { workspaceSlug: string, formId: string }) {
  const form = await getFormById(formId)

  if (!form) {
    notFound()
  }

  const fields = form.fields as FormField[]
  const publicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/f/${form.shareToken}`

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/w/${workspaceSlug}/forms`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{form.name}</h1>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/w/${workspaceSlug}/forms/${form.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/w/${workspaceSlug}/forms/${form.id}/share`}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/w/${workspaceSlug}/forms/${form.id}/responses`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Respuestas ({form._count.responses})
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={form.isActive ? 'default' : 'secondary'}>
                    {form.isActive ? (
                      <>
                        <Power className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <PowerOff className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plantilla base</p>
                  <p className="font-medium">{form.template?.name || 'Sin plantilla'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Creado por</p>
                  <p className="font-medium">{form.createdBy.name || form.createdBy.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium">{new Date(form.createdAt).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de campos</p>
                  <p className="font-medium">{fields.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Respuestas recibidas</p>
                  <p className="font-medium">{form._count.responses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campos del formulario</CardTitle>
              <CardDescription>
                Vista previa de los campos que contiene este formulario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{index + 1}. {field.label}</span>
                            {field.required && (
                              <Badge variant="outline" className="text-xs">
                                Requerido
                              </Badge>
                            )}
                          </div>
                          {field.helpText && (
                            <p className="text-sm text-muted-foreground">{field.helpText}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {field.type === 'text' && 'Texto'}
                            {field.type === 'textarea' && 'Texto largo'}
                          </Badge>
                          {field.allowAttachments && (
                            <Badge variant="outline" className="text-xs bg-pink-50 text-pink-600 border-pink-200">
                              Con adjuntos
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enlace público</CardTitle>
              <CardDescription>
                Comparte este enlace para que otros puedan completar el formulario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">{publicUrl}</p>
              </div>
              <CopyLinkButton url={publicUrl} className="w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{form._count.responses}</div>
                <p className="text-sm text-muted-foreground">Respuestas totales</p>
              </div>
              
              {form._count.responses > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p className="text-sm">
                    {form._count.responses} respuesta{form._count.responses !== 1 ? 's' : ''} recibida{form._count.responses !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function FormDetailPage({ params }: FormDetailPageProps) {
  const { slug, id } = await params

  return (
    <Suspense fallback={<FormDetailSkeleton />}>
      <FormDetailContent workspaceSlug={slug} formId={id} />
    </Suspense>
  )
}
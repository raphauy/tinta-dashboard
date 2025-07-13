import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getFormById } from '@/services/form-service'
import { ShareSettingsForm } from './share-settings-form'

interface SharePageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

function SharePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function SharePageContent({ workspaceSlug, formId }: { workspaceSlug: string, formId: string }) {
  const form = await getFormById(formId)

  if (!form) {
    notFound()
  }

  const publicUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/f/${form.shareToken}`

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/w/${workspaceSlug}/forms/${form.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al formulario
            </Link>
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Configuración de compartir</h1>
            <span className="text-lg text-muted-foreground">•</span>
            <span className="text-xl font-medium text-muted-foreground">{form.title2 ? `${form.title} ${form.title2}` : form.title}</span>
          </div>
          <p className="text-muted-foreground">
            Administra cómo se comparte y accede a tu formulario
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enlace público</CardTitle>
              <CardDescription>
                Este es el enlace que puedes compartir para que otros completen el formulario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-mono break-all">{publicUrl}</p>
                </div>
                <Button variant="outline" size="icon" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Abrir en nueva pestaña</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <ShareSettingsForm 
            form={form} 
            workspaceSlug={workspaceSlug}
            publicUrl={publicUrl}
          />

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Respuestas recibidas</p>
                <p className="text-2xl font-bold">{form._count.responses}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creado por</p>
                <p className="text-sm">{form.createdBy.name || form.createdBy.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de creación</p>
                <p className="text-sm">{new Date(form.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>
                Así es como se verá tu formulario público
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 w-full rounded-lg border bg-muted/50 overflow-hidden">
                <iframe
                  src={publicUrl}
                  className="h-full w-full"
                  title="Vista previa del formulario"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function SharePage({ params }: SharePageProps) {
  const { slug, id } = await params

  return (
    <Suspense fallback={<SharePageSkeleton />}>
      <SharePageContent workspaceSlug={slug} formId={id} />
    </Suspense>
  )
}
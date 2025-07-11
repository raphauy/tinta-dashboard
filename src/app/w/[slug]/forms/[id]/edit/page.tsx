import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getFormById } from '@/services/form-service'
import { FormEditForm } from './form-edit-form'

interface FormEditPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

function FormEditSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FormEditContent({ workspaceSlug, formId }: { workspaceSlug: string, formId: string }) {
  const form = await getFormById(formId)

  if (!form) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/w/${workspaceSlug}/forms/${form.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Editar formulario</h1>
          <p className="text-muted-foreground">
            Modifica el nombre y descripción de tu formulario
          </p>
        </div>
      </div>

      <FormEditForm form={form} workspaceSlug={workspaceSlug} />
    </div>
  )
}

export default async function FormEditPage({ params }: FormEditPageProps) {
  const { slug, id } = await params

  return (
    <Suspense fallback={<FormEditSkeleton />}>
      <FormEditContent workspaceSlug={slug} formId={id} />
    </Suspense>
  )
}
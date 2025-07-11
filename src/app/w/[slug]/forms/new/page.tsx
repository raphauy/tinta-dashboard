import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getWorkspaceBySlug } from '@/services/workspace-service'
import { getTemplates } from '@/services/template-service'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NewFormWizard } from './new-form-wizard'

interface NewFormPageProps {
  params: Promise<{
    slug: string
  }>
}

function NewFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

async function NewFormContent({ workspaceSlug }: { workspaceSlug: string }) {
  const [workspace, templates] = await Promise.all([
    getWorkspaceBySlug(workspaceSlug),
    getTemplates()
  ])

  if (!workspace) {
    notFound()
  }

  return (
    <NewFormWizard 
      workspaceSlug={workspaceSlug} 
      templates={templates} 
    />
  )
}

export default async function NewFormPage({ params }: NewFormPageProps) {
  const { slug } = await params
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear nuevo formulario</h1>
        <p className="text-muted-foreground">
          Selecciona una plantilla y personaliza tu formulario
        </p>
      </div>

      <Suspense fallback={<NewFormSkeleton />}>
        <NewFormContent workspaceSlug={slug} />
      </Suspense>
    </div>
  )
}
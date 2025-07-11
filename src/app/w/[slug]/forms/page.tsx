import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FormsList } from './forms-list'

interface FormsPageProps {
  params: Promise<{
    slug: string
  }>
}

function FormsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function FormsPage({ params }: FormsPageProps) {
  const { slug } = await params
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formularios</h1>
          <p className="text-muted-foreground">
            Gestiona los formularios de tu workspace
          </p>
        </div>
        <Button asChild>
          <Link href={`/w/${slug}/forms/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo formulario
          </Link>
        </Button>
      </div>

      <Suspense fallback={<FormsListSkeleton />}>
        <FormsList workspaceSlug={slug} />
      </Suspense>
    </div>
  )
}
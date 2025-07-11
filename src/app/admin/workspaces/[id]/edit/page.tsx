import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWorkspaceById } from '@/services/workspace-service'
import { WorkspaceForm } from '../../workspace-form'

interface EditWorkspacePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditWorkspacePage({ params }: EditWorkspacePageProps) {
  const { id } = await params
  
  const workspace = await getWorkspaceById(id)
  
  if (!workspace) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/workspaces">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Workspaces
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Workspace</h1>
            <p className="text-muted-foreground">
              Modifica la información del workspace &quot;{workspace.name}&quot;
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Workspace</CardTitle>
          <CardDescription>
            Actualiza el nombre, slug y descripción del workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkspaceForm workspace={workspace} isEdit={true} />
        </CardContent>
      </Card>
    </div>
  )
}
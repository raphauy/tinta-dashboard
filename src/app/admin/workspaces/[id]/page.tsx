import { notFound } from 'next/navigation'
import { ArrowLeft, Users, Calendar, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getWorkspaceById } from '@/services/workspace-service'
import { WorkspaceActionsClient } from '../workspace-actions-client'

interface WorkspaceDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkspaceDetailPage({ params }: WorkspaceDetailPageProps) {
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
            <h1 className="text-2xl font-bold">{workspace.name}</h1>
            <p className="text-muted-foreground">
              Información detallada del workspace
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/workspaces/${workspace.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <WorkspaceActionsClient 
            workspace={{
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              description: workspace.description,
              createdAt: workspace.createdAt,
              updatedAt: workspace.updatedAt,
              _count: workspace._count
            }} 
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Detalles básicos del workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
              <p className="text-sm">{workspace.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Slug</Label>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{workspace.slug}</p>
            </div>
            {workspace.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                <p className="text-sm">{workspace.description}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Creado</Label>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {workspace.createdAt.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Colaboradores actuales del workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {workspace.users.length} {workspace.users.length === 1 ? 'usuario' : 'usuarios'}
              </span>
            </div>
            <div className="space-y-2">
              {workspace.users.map((userWorkspace) => (
                <div key={userWorkspace.user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{userWorkspace.user.email}</p>
                    {userWorkspace.user.name && (
                      <p className="text-xs text-muted-foreground">{userWorkspace.user.name}</p>
                    )}
                  </div>
                  <Badge variant={userWorkspace.role === 'admin' ? 'default' : 'secondary'}>
                    {userWorkspace.role === 'admin' ? 'Admin' : 'Colaborador'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
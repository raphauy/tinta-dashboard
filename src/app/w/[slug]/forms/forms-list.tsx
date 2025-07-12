import Link from 'next/link'
import { getWorkspaceBySlug } from '@/services/workspace-service'
import { getFormsByWorkspace } from '@/services/form-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormActionsClient } from './form-actions-client'
import { FileText, Calendar, BarChart3, Users } from 'lucide-react'
import { notFound } from 'next/navigation'

interface FormsListProps {
  workspaceSlug: string
}

export async function FormsList({ workspaceSlug }: FormsListProps) {
  const workspace = await getWorkspaceBySlug(workspaceSlug)
  
  if (!workspace) {
    notFound()
  }

  const forms = await getFormsByWorkspace(workspace.id)

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay formularios aún</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Comienza creando tu primer formulario desde una plantilla
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <Card key={form.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  <Link 
                    href={`/w/${workspaceSlug}/forms/${form.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {form.name}
                  </Link>
                </CardTitle>
                {form.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </div>
              <FormActionsClient form={form} workspaceSlug={workspaceSlug} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{form.template?.name || 'Sin plantilla'}</span>
              </div>
              <Badge variant={form.isActive ? 'default' : 'secondary'}>
                {form.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Creado {new Date(form.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>{form._count.responses} respuesta{form._count.responses !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Por {form.createdBy.name || form.createdBy.email}</span>
              </div>
            </div>

            {form._count.responses > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {form._count.responses} respuesta{form._count.responses !== 1 ? 's' : ''} total{form._count.responses !== 1 ? 'es' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
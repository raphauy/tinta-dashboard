import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getFormById } from "@/services/form-service"
import { getFormResponses } from "@/services/form-response-service"
import { getUserWorkspaces } from "@/services/workspace-service"
import { ResponsesList } from "./responses-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Users, Clock } from "lucide-react"
import Link from "next/link"

interface ResponsesPageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { slug, id: formId } = await params

  // Verificar acceso al workspace
  const userWorkspaces = await getUserWorkspaces(session.user.id)
  const workspace = userWorkspaces.find(ws => ws.workspace.slug === slug)
  
  if (!workspace && session.user.role !== "superadmin") {
    notFound()
  }

  // Obtener formulario
  const form = await getFormById(formId)
  if (!form) {
    notFound()
  }

  // Verificar que el formulario pertenece al workspace
  if (form.workspace.slug !== slug) {
    notFound()
  }

  // Obtener respuestas
  const responses = await getFormResponses(formId)

  // Estadísticas rápidas
  const stats = {
    total: responses.length,
    new: responses.filter(r => r.status === 'new').length,
    reviewed: responses.filter(r => r.status === 'reviewed').length,
    processed: responses.filter(r => r.status === 'processed').length,
    withFiles: responses.filter(r => r.files.length > 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href={`/w/${slug}/forms`}
              className="hover:text-foreground transition-colors"
            >
              Formularios
            </Link>
            <span>/</span>
            <Link 
              href={`/w/${slug}/forms/${formId}`}
              className="hover:text-foreground transition-colors"
            >
              {form.name}
            </Link>
            <span>/</span>
            <span>Respuestas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Respuestas de &ldquo;{form.name}&rdquo;
          </h1>
          <p className="text-muted-foreground">
            Gestiona y revisa todas las respuestas recibidas para este formulario
          </p>
        </div>
        
        <Button variant="outline" asChild>
          <Link href={`/w/${slug}/forms/${formId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Formulario
          </Link>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Respuestas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.withFiles} con archivos adjuntos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevas
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revisadas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
            <p className="text-xs text-muted-foreground">
              En proceso de trabajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Procesadas
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.processed}</div>
            <p className="text-xs text-muted-foreground">
              Trabajo completado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de respuestas */}
      {responses.length > 0 ? (
        <ResponsesList 
          responses={responses}
          workspaceSlug={slug}
          formId={formId}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Sin respuestas aún</CardTitle>
            <CardDescription>
              Este formulario no ha recibido respuestas todavía. Las respuestas aparecerán aquí cuando los clientes completen el formulario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href={`/w/${slug}/forms/${formId}`}>
                  Ver Formulario
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/f/${form.shareToken}`} target="_blank">
                  Probar Formulario Público
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
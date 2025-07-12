import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getFormResponseById } from "@/services/form-response-service"
import { getUserWorkspaces } from "@/services/workspace-service"
import { ResponseViewer } from "./response-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ResponseViewPageProps {
  params: Promise<{
    slug: string
    id: string
    responseId: string
  }>
}

export default async function ResponseViewPage({ params }: ResponseViewPageProps) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { slug, id: formId, responseId } = await params

  // Verificar acceso al workspace
  const userWorkspaces = await getUserWorkspaces(session.user.id)
  const workspace = userWorkspaces.find(ws => ws.workspace.slug === slug)
  
  if (!workspace && session.user.role !== "superadmin") {
    notFound()
  }

  // Obtener la respuesta
  const response = await getFormResponseById(responseId)
  if (!response) {
    notFound()
  }

  // Verificar que la respuesta pertenece al formulario y workspace correctos
  if (response.form.id !== formId || response.form.workspace.slug !== slug) {
    notFound()
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
              {response.form.name}
            </Link>
            <span>/</span>
            <Link 
              href={`/w/${slug}/forms/${formId}/responses`}
              className="hover:text-foreground transition-colors"
            >
              Respuestas
            </Link>
            <span>/</span>
            <span>Ver Respuesta</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Respuesta de &ldquo;{response.form.name}&rdquo;
          </h1>
          <p className="text-muted-foreground">
            Enviada el <span suppressHydrationWarning>
              {(() => {
                try {
                  const date = new Date(response.submittedAt)
                  if (isNaN(date.getTime())) return 'Fecha inválida'
                  return date.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                } catch {
                  return 'Fecha inválida'
                }
              })()}
            </span>
          </p>
        </div>
        
        <Button variant="outline" asChild>
          <Link href={`/w/${slug}/forms/${formId}/responses`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Respuestas
          </Link>
        </Button>
      </div>

      {/* Viewer de respuesta */}
      <ResponseViewer 
        response={response} 
      />
    </div>
  )
}
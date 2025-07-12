import { notFound } from "next/navigation"
import { getFormByToken, isFormActiveByToken } from "@/services/form-service"
import { PublicFormRenderer } from "./public-form-renderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import { CheckCircle, MessageCircle } from "lucide-react"

interface PublicFormPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { token } = await params

  // Validar que el formulario existe y está activo
  const [form, isActive] = await Promise.all([
    getFormByToken(token),
    isFormActiveByToken(token)
  ])

  if (!form || !isActive) {
    notFound()
  }

  // Verificar si ya se enviaron respuestas y no se permiten múltiples envíos
  const hasAnyResponses = form._count?.responses > 0
  const shouldBlockSubmission = hasAnyResponses && !form.allowEdits

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header del formulario */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-tinta-verde-uva mb-2">
          {form.name}
        </h1>
        {form.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {form.description}
          </p>
        )}
        <div className="mt-4 p-4 bg-tinta-paper/50 dark:bg-gray-800/50 rounded-lg border border-tinta-paper/80 dark:border-gray-700/80">
          <div className="flex items-center space-x-3 mb-2">
            <WorkspaceAvatar 
              workspace={form.workspace}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {form.workspace.name}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {shouldBlockSubmission 
              ? "Este formulario ya no acepta más respuestas."
              : "Completa todos los campos obligatorios para enviar tu información."
            }
          </p>
        </div>
      </div>

      {/* Mostrar mensaje de ya enviado o el formulario */}
      {shouldBlockSubmission ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Formulario cerrado</CardTitle>
            <CardDescription className="text-lg">
              Este formulario ya no acepta más respuestas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3 justify-center">
                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Tinta ya está procesando las respuestas recibidas
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <WorkspaceAvatar 
                  workspace={form.workspace}
                  size="lg"
                />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {form.workspace.name}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Si tienes preguntas o necesitas información adicional, 
                contáctanos en{" "}
                <a 
                  href="mailto:contacto@tinta.wine" 
                  className="text-primary hover:underline"
                >
                  contacto@tinta.wine
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PublicFormRenderer form={form} />
      )}
    </div>
  )
}

export async function generateMetadata({ params }: PublicFormPageProps) {
  const { token } = await params
  const form = await getFormByToken(token)
  
  if (!form) {
    return {
      title: "Formulario no encontrado - Tinta Agency"
    }
  }

  return {
    title: `${form.name} - Tinta Agency`,
    description: form.description || `Completa el formulario ${form.name} para ${form.workspace.name}`,
  }
}
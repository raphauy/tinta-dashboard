import { notFound } from "next/navigation"
import { getFormByToken, isFormActiveByToken } from "@/services/form-service"
import { PublicFormRenderer } from "./public-form-renderer"

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header del formulario */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {form.name}
        </h1>
        {form.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {form.description}
          </p>
        )}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Cliente:</strong> {form.workspace.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Completa todos los campos obligatorios para enviar tu información.
          </p>
        </div>
      </div>

      {/* Renderizador del formulario */}
      <PublicFormRenderer form={form} />
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
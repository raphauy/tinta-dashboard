import { notFound } from "next/navigation"
import { getFormByToken, isFormActiveByToken } from "@/services/form-service"
import { PdfStyleFormRenderer } from "./pdf-style-form-renderer"
import { CheckCircle, MessageCircle } from "lucide-react"
import { getTintaColor } from "@/lib/tinta-colors"

interface PdfStyleFormPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function PdfStyleFormPage({ params }: PdfStyleFormPageProps) {
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
    <>
      {/* Header estilo PDF con padding */}
      <div className="p-8 md:p-12 pb-6 md:pb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Lado izquierdo - Título del formulario */}
          <div className="flex-1">
            {form.title2 && form.color ? (
              // Título con dos líneas y círculo de color
              <div className="space-y-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-6xl font-bold leading-none tracking-tight" style={{ color: '#8A8A7C' }}>
                    {form.title}
                  </h1>
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: getTintaColor(form.color) || '#DDBBC0' }}
                  />
                </div>
                <h2 className="text-6xl font-bold leading-none tracking-tight -mt-2" style={{ color: '#8A8A7C' }}>
                  {form.title2}
                </h2>
              </div>
            ) : (
              // Título simple sin círculo
              <h1 className="text-6xl font-bold leading-tight tracking-tight" style={{ color: '#8A8A7C' }}>
                {form.title}
              </h1>
            )}
          </div>
          
          {/* Lado derecho - Campos dinámicos */}
          <div className="lg:w-96 space-y-3 lg:mt-2">
            <div className="flex items-baseline gap-3 border-b border-stone-300 pb-1">
              <div className="text-xs text-stone-400 uppercase tracking-widest font-medium min-w-fit">
                NOMBRE DEL PROYECTO
              </div>
              <div className="text-sm text-stone-600 dark:text-gray-600 flex-1 min-w-0">
                {form.projectName || "___________"}
              </div>
            </div>
            <div className="flex items-baseline gap-3 border-b border-stone-300 pb-1">
              <div className="text-xs text-stone-400 uppercase tracking-widest font-medium min-w-fit">
                CLIENTE
              </div>
              <div className="text-sm text-stone-600 dark:text-gray-600 flex-1 min-w-0">
                {form.client || "___________"}
              </div>
            </div>
            <div className="flex items-baseline gap-3 border-b border-stone-300 pb-1">
              <div className="text-xs text-stone-400 uppercase tracking-widest font-medium min-w-fit">
                FECHA
              </div>
              <div className="text-sm text-stone-600 dark:text-gray-600 flex-1 min-w-0">
                {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </div>
        
        {/* Línea horizontal con el mismo padding que el contenido */}
        <div className="border-b-2 border-stone-300 mt-6"></div>
      </div>
      
      {/* Descripción del formulario centrada debajo de la línea */}
      {form.subtitle && (
        <div className="text-center pt-0 pb-6 px-8 md:px-12">
          <p className="font-semibold text-2xl tracking-wide" style={{ color: '#8A8A7C' }}>
            {form.subtitle}
          </p>
        </div>
      )}
      
      {/* Contenido del formulario con padding */}
      <div className="px-8 md:px-12 pb-8 md:pb-12">
        {/* Mostrar mensaje de ya enviado o el formulario */}
        {shouldBlockSubmission ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-light text-stone-700 dark:text-gray-700 mb-4">
              Formulario cerrado
            </h2>
            <p className="text-stone-600 dark:text-gray-600 mb-6">
              Este formulario ya no acepta más respuestas.
            </p>
            
            <div className="p-4 bg-green-50 dark:bg-green-100 rounded-lg border border-green-200 mb-6">
              <div className="flex items-center gap-3 justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Tinta ya está procesando las respuestas recibidas
                </p>
              </div>
            </div>
            
            <p className="text-sm text-stone-500 dark:text-gray-600">
              Si tienes preguntas o necesitas información adicional, 
              contáctanos en{" "}
              <a 
                href="mailto:hola@tinta.wine" 
                className="text-tinta-verde-uva hover:underline"
              >
                hola@tinta.wine
              </a>
            </p>
          </div>
        ) : (
          <PdfStyleFormRenderer form={form} />
        )}
      </div>
    </>
  )
}

export async function generateMetadata({ params }: PdfStyleFormPageProps) {
  const { token } = await params
  const form = await getFormByToken(token)
  
  if (!form) {
    return {
      title: "Formulario no encontrado - Tinta Agency"
    }
  }

  return {
    title: `${form.title2 ? `${form.title} ${form.title2}` : form.title} - Tinta Agency`,
    description: form.subtitle || `Completa el formulario ${form.title2 ? `${form.title} ${form.title2}` : form.title} para ${form.workspace.name}`,
  }
}
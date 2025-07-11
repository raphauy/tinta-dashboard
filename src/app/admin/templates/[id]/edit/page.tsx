import { notFound } from "next/navigation"
import Link from "next/link"
import { getTemplateById } from "@/services/template-service"
import { TemplateForm } from "../../template-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface EditTemplatePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params
  const template = await getTemplateById(id)

  if (!template) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/templates/${template.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Plantilla</h1>
          <p className="text-muted-foreground">
            Modifica los campos y configuración de la plantilla
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Plantilla</CardTitle>
          <CardDescription>
            Actualiza los campos y estructura de esta plantilla. Los cambios no afectarán a los formularios ya creados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm template={template} />
        </CardContent>
      </Card>
    </div>
  )
}
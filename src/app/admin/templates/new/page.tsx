import { TemplateForm } from "../template-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewTemplatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Plantilla</h1>
        <p className="text-muted-foreground">
          Crea una plantilla de formulario reutilizable para todos los workspaces
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Plantilla</CardTitle>
          <CardDescription>
            Define los campos y estructura que tendrá esta plantilla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm />
        </CardContent>
      </Card>
    </div>
  )
}
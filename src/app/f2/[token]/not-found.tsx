import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, Mail } from "lucide-react"

export default function NotFoundPublicForm() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Formulario no encontrado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-muted-foreground">
              El formulario que estás buscando no existe, ha expirado o no está disponible.
            </p>
            <p className="text-sm text-muted-foreground">
              Esto puede ocurrir si:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1 max-w-md mx-auto">
              <li>• El enlace del formulario es incorrecto</li>
              <li>• El formulario ha sido desactivado</li>
              <li>• El enlace ha expirado</li>
              <li>• Ya no tienes acceso a este formulario</li>
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si crees que esto es un error, contáctanos directamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <a href="mailto:hola@tinta.wine">
                  <Mail className="w-4 h-4 mr-2" />
                  Contactar Soporte
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Si tienes un enlace diferente del formulario, puedes intentar usarlo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
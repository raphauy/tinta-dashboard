import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Formulario - Tinta Agency",
  description: "Completa tu brief para Tinta Agency - Especialistas en marketing de vinos",
}

export default function PublicFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {/* Header con branding Tinta */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">
                  Tinta Agency
                </h1>
                <p className="text-sm text-muted-foreground">
                  Especialistas en marketing de vinos
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-card mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                © 2025 Tinta Agency. Formulario seguro y protegido.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                ¿Tienes preguntas? Contáctanos en{" "}
                <a 
                  href="mailto:contacto@tinta.wine" 
                  className="text-primary hover:underline"
                >
                  contacto@tinta.wine
                </a>
              </p>
            </div>
          </div>
        </footer>

        <Toaster theme="system" />
      </ThemeProvider>
    </div>
  )
}
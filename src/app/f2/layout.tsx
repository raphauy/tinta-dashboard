import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Image from "next/image"

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
                <div className="flex items-center justify-center mb-2">
                  <Image 
                    src="/tinta-logo.ico" 
                    alt="Tinta Agency Logo" 
                    width={32} 
                    height={32} 
                    className="mr-3"
                  />
                  <Image 
                    src="/Tinta_N.png" 
                    alt="Tinta Logotype" 
                    width={80} 
                    height={32}
                    className="dark:hidden"
                  />
                  <Image 
                    src="/Tinta_B.png" 
                    alt="Tinta Logotype" 
                    width={80} 
                    height={32}
                    className="hidden dark:block"
                  />
                </div>
                <p className="text-sm text-tinta-gris/70 dark:text-gray-300">
                  Embajadores de la cultura del vino
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
        <footer className="border-t bg-tinta-paper/30 dark:bg-gray-900/50 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  <Image 
                    src="/tinta-logo.ico" 
                    alt="Tinta Agency Logo" 
                    width={20} 
                    height={20} 
                    className="mr-2"
                  />
                  <Image 
                    src="/Tinta_N.png" 
                    alt="Tinta Logotype" 
                    width={50} 
                    height={20}
                    className="dark:hidden"
                  />
                  <Image 
                    src="/Tinta_B.png" 
                    alt="Tinta Logotype" 
                    width={50} 
                    height={20}
                    className="hidden dark:block"
                  />
                </div>
              </div>
              <p className="text-sm text-tinta-gris dark:text-gray-300">
                © 2025 Tinta Agency. Formulario seguro y protegido.
              </p>
              <p className="text-xs text-tinta-gris/70 dark:text-gray-400">
                ¿Tienes preguntas? Contáctanos en{" "}
                <a 
                  href="mailto:hola@tinta.wine" 
                  className="text-tinta-verde-uva dark:text-tinta-paper hover:underline font-medium"
                >
                  hola@tinta.wine
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
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import Image from "next/image"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Formulario - Tinta Agency",
  description: "Completa tu brief para Tinta Agency - Especialistas en marketing de vinos",
}

export default function PdfStyleFormLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen bg-white dark:bg-gray-900 flex flex-col ${geistSans.variable} ${geistMono.variable} font-sans`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {/* Header minimalista con logo */}
        <header className="py-4 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center">
              <Image 
                src="/tinta-logo.ico" 
                alt="Tinta Agency Logo" 
                width={24} 
                height={24} 
                className="mr-3"
              />
              <Image 
                src="/Tinta_N.png" 
                alt="Tinta Logotype" 
                width={80} 
                height={32}
                className=""
              />
            </div>
          </div>
        </header>

        {/* Main content con estilo papel */}
        <main className="container mx-auto px-4 py-4 flex-1 max-w-4xl">
          <div className="bg-tinta-verde-uva/5 dark:bg-gray-100 shadow-xl rounded-lg border border-gray-200 dark:border-gray-300 min-h-[calc(100vh-4rem)] overflow-hidden">
            {children}
          </div>
        </main>

        {/* Footer con branding minimalista */}
        <footer className="py-6">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Image 
                  src="/tinta-logo.ico" 
                  alt="Tinta Agency Logo" 
                  width={16} 
                  height={16} 
                  className="mr-2 opacity-60"
                />
                <Image 
                  src="/Tinta_N.png" 
                  alt="Tinta Logotype" 
                  width={40} 
                  height={16}
                  className="opacity-60"
                />
              </div>
              <p className="text-xs text-stone-500 dark:text-gray-600">
                © 2025 Tinta Agency. Formulario seguro y protegido.
              </p>
            </div>
          </div>
        </footer>

        <Toaster theme="light" />
      </ThemeProvider>
    </div>
  )
}
# PRP: Exportación de Respuestas de Formularios a PDF

## Goal
Implementar la funcionalidad de exportación a PDF en la vista individual de respuestas (`/w/[slug]/forms/[id]/responses/[responseId]`) que genere un documento PDF con el mismo diseño visual que el formulario público (`/f/[token]`), incluyendo todos los datos de la respuesta y las imágenes adjuntas embebidas directamente en el PDF.

## Why
- **Valor de negocio**: Permitir a los administradores compartir briefs completos con diseñadores y equipos externos de forma profesional
- **Impacto en usuarios**: Eliminar la necesidad de capturar pantallas o copiar/pegar información manualmente
- **Integración con Tinta**: Los PDFs mantendrán la identidad visual de marca establecida
- **Problemas que resuelve**: 
  - Actualmente no hay forma de exportar respuestas completas con archivos
  - Los diseñadores reciben información fragmentada en múltiples formatos
  - Se pierde contexto al compartir solo archivos sueltos

## What
Un botón "Exportar PDF" en la vista de respuesta individual que genere un PDF con:
- El mismo diseño visual del formulario público (header con círculo de color, metadatos, etc.)
- Todos los campos de respuesta con sus valores
- Imágenes adjuntas embebidas directamente en el PDF (no como links)
- Otros archivos listados con información (nombre, tamaño, tipo)
- Información de contexto (fecha de envío, estado, etc.)

### Success Criteria
- [ ] Botón "Exportar PDF" visible en la UI de respuesta individual
- [ ] PDF generado replica exactamente el diseño de `/f/[token]`
- [ ] Todas las imágenes adjuntas aparecen embebidas en el PDF
- [ ] Archivos no-imagen se listan con sus metadatos
- [ ] El PDF se descarga automáticamente con nombre descriptivo
- [ ] Tests de integración pasan para la funcionalidad completa
- [ ] Performance aceptable (<5s para respuestas con múltiples imágenes)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Reglas arquitectónicas estrictas del proyecto
  
- file: prisma/schema.prisma
  why: Modelos FormResponse y FormResponseFile necesarios
  sections: "FormResponse, FormResponseFile, Form models"
  
- file: src/services/form-response-service.ts
  why: Servicio con getFormResponseById() para obtener datos
  
- file: src/app/w/[slug]/forms/[id]/responses/[responseId]/page.tsx
  why: Página donde se agregará el botón de exportación
  
- file: src/app/w/[slug]/forms/[id]/responses/[responseId]/response-viewer.tsx
  why: Componente actual que muestra la respuesta
  
- file: src/app/f/[token]/page.tsx
  why: CRÍTICO - Diseño visual exacto a replicar en PDF
  
- file: src/app/f/[token]/pdf-style-field-renderer.tsx
  why: Renderizado de campos en estilo PDF
  
- file: src/lib/utils/tinta-colors.ts
  why: Paleta de colores oficial de Tinta
  
- file: docs/research/puppeteer-implementation-example.md
  why: Ejemplo de implementación con Puppeteer recomendado
  
- file: src/services/upload-service.ts
  why: Referencia para manejo de archivos Blob
  
- file: src/app/api/files/[fileId]/route.ts
  why: Patrón de descarga segura de archivos
  
- url: https://pptr.dev/guides/pdf-generation
  why: Documentación oficial de Puppeteer para PDFs
  section: "Page.pdf() options"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── w/[slug]/forms/[id]/responses/
│   │   ├── [responseId]/
│   │   │   ├── page.tsx              # RSC principal
│   │   │   └── response-viewer.tsx   # Cliente que muestra respuesta
│   │   └── page.tsx                  # Lista de respuestas
│   ├── f/[token]/                    # Formulario público
│   │   ├── page.tsx                  # Diseño a replicar
│   │   └── pdf-style-field-renderer.tsx
│   └── api/
│       └── files/[fileId]/route.ts   # Descarga segura
├── services/
│   ├── form-response-service.ts      # Obtener datos
│   └── upload-service.ts             # Referencia Blob
├── lib/
│   └── utils/
│       └── tinta-colors.ts           # Colores oficiales
└── types/
    └── forms.ts                      # Tipos TypeScript
```

### Desired Codebase Tree
```bash
src/
├── services/
│   └── pdf-export-service.ts         # NUEVA - Lógica de generación PDF
├── app/
│   ├── w/[slug]/forms/[id]/responses/
│   │   ├── [responseId]/
│   │   │   ├── actions.ts            # NUEVA - Server action para PDF
│   │   │   └── response-viewer.tsx   # MODIFICAR - Agregar botón
│   │   └── pdf-template/             # NUEVA - Template HTML para PDF
│   │       └── response-pdf-template.tsx
│   └── api/
│       └── pdf/
│           └── generate/route.ts     # NUEVA - API para generar PDF
└── lib/
    └── pdf/
        └── puppeteer-config.ts       # NUEVA - Configuración Puppeteer
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Arquitectura en capas (docs/architecture.md)
// - SOLO services/ puede importar prisma
// - Server Actions en lugar de API routes cuando sea posible
// - Co-ubicación: componentes específicos junto a páginas

// PATTERN: Server Action para trigger de exportación
// src/app/w/[slug]/forms/[id]/responses/[responseId]/actions.ts
"use server"
export async function exportResponseToPDF(responseId: string) {
  // Verificar autenticación y permisos
  // Llamar a pdf-export-service
  // Retornar URL temporal o blob
}

// GOTCHA: Puppeteer en Vercel requiere configuración especial
// - Usar puppeteer-core + chrome-aws-lambda
// - Límite de 50MB para funciones Lambda
// - Timeout máximo de 10s en Hobby, 60s en Pro

// PATTERN: Descarga segura de archivos temporales
// Similar a /api/files/[fileId] pero para PDFs generados

// GOTCHA: Imágenes de Vercel Blob
// - Necesitan autenticación para acceder
// - Usar Server Component para pre-fetch URLs firmadas

// PATTERN: Diseño Tinta - Colores oficiales
import { getTintaColor } from '@/lib/utils/tinta-colors'
const circleColor = getTintaColor(form.color || 'rosa-vino')
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Tipos para generación de PDF
// src/types/pdf.ts
export interface PDFGenerationOptions {
  responseId: string
  includeImages: boolean
  includeMetadata: boolean
}

export interface PDFTemplateData {
  form: {
    title: string
    title2?: string
    color?: string
    subtitle?: string
    projectName?: string
    client?: string
    fields: FormField[]
  }
  response: {
    data: Record<string, any>
    submittedAt: Date
    status: string
  }
  files: {
    fieldName: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }[]
  workspace: {
    name: string
  }
}

// 2. Configuración de Puppeteer
// src/lib/pdf/puppeteer-config.ts
export const getPuppeteerConfig = () => {
  if (process.env.VERCEL) {
    // Configuración para Vercel
    return {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    }
  }
  // Configuración local
  return { headless: 'new' }
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Configurar Puppeteer
CREATE src/lib/pdf/puppeteer-config.ts:
  - IF Vercel: usar puppeteer-core + @sparticuz/chromium
  - ELSE: usar puppeteer normal
  - EXPORT función getPuppeteerConfig()
  - INSTALL: pnpm add puppeteer puppeteer-core @sparticuz/chromium

Task 2: Template HTML para PDF
CREATE src/app/w/[slug]/forms/[id]/responses/pdf-template/response-pdf-template.tsx:
  - COPY estructura visual de src/app/f/[token]/page.tsx
  - ADAPT para recibir props con datos completos
  - INCLUDE logo Tinta, header con círculo, metadatos
  - RENDER campos con valores de respuesta
  - EMBED imágenes con base64 o URLs firmadas
  - LIST archivos no-imagen con metadatos

Task 3: Servicio de Exportación PDF
CREATE src/services/pdf-export-service.ts:
  - FUNCTION generateResponsePDF(responseId, options)
  - FETCH datos completos con getFormResponseById
  - VALIDATE permisos del usuario
  - PREPARE datos para template
  - LAUNCH Puppeteer con configuración
  - RENDER template a HTML
  - GENERATE PDF con opciones A4
  - RETURN Buffer o upload a Blob temporal

Task 4: Server Action
CREATE src/app/w/[slug]/forms/[id]/responses/[responseId]/actions.ts:
  - 'use server' directiva
  - ACTION exportResponseToPDF(responseId)
  - AUTH check con auth()
  - VERIFY workspace membership
  - CALL pdf-export-service
  - TRIGGER descarga directa o return URL

Task 5: Actualizar Response Viewer
MODIFY src/app/w/[slug]/forms/[id]/responses/[responseId]/response-viewer.tsx:
  - IMPORT Server Action
  - ADD botón "Exportar PDF" en header
  - ICON: FileDown de lucide-react
  - LOADING state durante generación
  - TOAST success/error
  - TRIGGER descarga automática

Task 6: API Route para PDFs grandes (opcional)
CREATE src/app/api/pdf/generate/route.ts:
  - ONLY IF Server Action timeout
  - POST handler con responseId
  - AUTH y permisos check
  - STREAM PDF generation
  - RETURN PDF con headers correctos

Task 7: Optimización de Imágenes
UPDATE pdf-export-service.ts:
  - FETCH imágenes de Blob con URLs firmadas
  - OPTIMIZE tamaño si >1MB
  - EMBED como base64 o URL según tamaño
  - HANDLE errores de carga

Task 8: Estilos y Ajustes Visuales
UPDATE response-pdf-template.tsx:
  - MATCH exactamente colores Tinta
  - RESPONSIVE para diferentes tamaños de contenido
  - PAGE breaks inteligentes
  - FONTS: embed Geist Sans si posible

Task 9: Testing
CREATE src/services/__tests__/pdf-export-service.test.ts:
  - MOCK Puppeteer para tests
  - TEST generación con diferentes tipos de respuesta
  - VERIFY permisos y autenticación
  - CHECK manejo de errores

Task 10: Documentación
UPDATE relevant docs:
  - ADD nueva funcionalidad a features.md
  - DOCUMENT configuración Puppeteer
  - USAGE examples
```

### Per-Task Pseudocode
```typescript
// Task 2: Template HTML
// src/app/w/[slug]/forms/[id]/responses/pdf-template/response-pdf-template.tsx
export function ResponsePDFTemplate({ data }: { data: PDFTemplateData }) {
  const { form, response, files, workspace } = data
  const circleColor = getTintaColor(form.color || 'rosa-vino')
  
  return (
    <html>
      <head>
        <style>{`
          @page { size: A4; margin: 20mm; }
          body { font-family: system-ui, -apple-system, sans-serif; }
          .tinta-verde-uva { color: #143F3B; }
          /* ... más estilos ... */
        `}</style>
      </head>
      <body>
        {/* Logo Tinta */}
        <div className="header">
          {/* Replicar diseño de /f/[token] */}
        </div>
        
        {/* Campos con respuestas */}
        {form.fields.map((field, index) => (
          <div key={field.id}>
            <label>{String(index + 1).padStart(2, '0')}. {field.label}</label>
            <div>{response.data[field.id]}</div>
            
            {/* Archivos del campo */}
            {files
              .filter(f => f.fieldName === field.id)
              .map(file => (
                file.fileType.startsWith('image/') ? (
                  <img src={file.fileUrl} alt={file.fileName} />
                ) : (
                  <div>📎 {file.fileName} ({formatFileSize(file.fileSize)})</div>
                )
              ))}
          </div>
        ))}
      </body>
    </html>
  )
}

// Task 3: Servicio de Exportación
// src/services/pdf-export-service.ts
import puppeteer from 'puppeteer'
import { getPuppeteerConfig } from '@/lib/pdf/puppeteer-config'
import { renderToStaticMarkup } from 'react-dom/server'

export async function generateResponsePDF(
  responseId: string,
  userId: string
): Promise<Buffer> {
  // FETCH datos
  const responseData = await getFormResponseById(responseId)
  if (!responseData) throw new Error('Respuesta no encontrada')
  
  // VERIFY permisos
  const hasAccess = await verifyWorkspaceAccess(
    userId,
    responseData.form.workspaceId
  )
  if (!hasAccess) throw new Error('Sin permisos')
  
  // PREPARE template data
  const templateData: PDFTemplateData = {
    form: responseData.form,
    response: responseData,
    files: responseData.files,
    workspace: responseData.form.workspace
  }
  
  // RENDER HTML
  const html = renderToStaticMarkup(
    <ResponsePDFTemplate data={templateData} />
  )
  
  // GENERATE PDF
  const browser = await puppeteer.launch(getPuppeteerConfig())
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    })
    
    return pdf
  } finally {
    await browser.close()
  }
}

// Task 4: Server Action
// src/app/w/[slug]/forms/[id]/responses/[responseId]/actions.ts
"use server"

import { auth } from '@/lib/auth'
import { generateResponsePDF } from '@/services/pdf-export-service'

export async function exportResponseToPDF(responseId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, message: 'No autenticado' }
  }
  
  try {
    const pdfBuffer = await generateResponsePDF(responseId, session.user.id)
    
    // Opción 1: Upload a Blob temporal
    const blob = await uploadToBlob(pdfBuffer, {
      filename: `respuesta-${responseId}.pdf`,
      contentType: 'application/pdf'
    })
    
    return { 
      success: true, 
      downloadUrl: blob.url,
      filename: `respuesta-${responseId}.pdf`
    }
  } catch (error) {
    console.error('Error generando PDF:', error)
    return { success: false, message: 'Error al generar PDF' }
  }
}
```

### Integration Points
```yaml
AUTHENTICATION:
  - usar auth() de NextAuth
  - verificar session.user existe
  
PERMISSIONS:
  - verificar membership en workspace
  - usar existing hasWorkspaceAccess helper
  
STORAGE:
  - Vercel Blob para PDFs temporales
  - URLs firmadas con expiración (1 hora)
  
UI COMPONENTS:
  - Button de shadcn/ui
  - Toast para feedback
  - Loading spinner durante generación

ERROR HANDLING:
  - timeouts de Puppeteer (30s máximo)
  - imágenes no disponibles
  - PDFs muy grandes (>10MB)
```

## Validation Loop

### Level 1: Syntax & Types
```bash
pnpm run lint
pnpm run typecheck
# Expected: 0 errores
```

### Level 2: Dependencies
```bash
# Instalar dependencias
pnpm add puppeteer puppeteer-core @sparticuz/chromium
pnpm add -D @types/puppeteer

# Verificar instalación
pnpm list puppeteer
```

### Level 3: Unit Tests
```typescript
// src/services/__tests__/pdf-export-service.test.ts
import { generateResponsePDF } from '../pdf-export-service'

jest.mock('puppeteer')

describe('PDF Export Service', () => {
  test('generates PDF with response data', async () => {
    const mockResponse = { /* mock data */ }
    const pdf = await generateResponsePDF('test-id', 'user-id')
    expect(pdf).toBeInstanceOf(Buffer)
  })
  
  test('throws on invalid permissions', async () => {
    await expect(
      generateResponsePDF('test-id', 'unauthorized-user')
    ).rejects.toThrow('Sin permisos')
  })
})
```

### Level 4: Integration Testing
```bash
# Development server
pnpm run dev

# Manual test:
1. Navegar a una respuesta: /w/[slug]/forms/[id]/responses/[responseId]
2. Click en "Exportar PDF"
3. Verificar PDF descargado correctamente
4. Verificar imágenes embebidas
5. Verificar diseño matches /f/[token]
```

### Level 5: Production Build
```bash
# Build
pnpm run build

# Verificar tamaño de funciones
# Puppeteer + Chromium debe ser <50MB para Vercel

# Test en producción local
pnpm run start
```

## Final Checklist

### Arquitectura
- [ ] Solo services/ importa Prisma
- [ ] Server Action co-ubicada con página
- [ ] Validación y permisos implementados
- [ ] Manejo de errores robusto
- [ ] Co-ubicación modular respetada

### Funcionalidad
- [ ] PDF replica exactamente diseño de formulario público
- [ ] Imágenes embebidas correctamente
- [ ] Archivos no-imagen listados con metadatos
- [ ] Descarga automática funciona
- [ ] Performance <5s para casos típicos
- [ ] Funciona en Vercel (producción)

### UI/UX
- [ ] Botón integrado naturalmente en response-viewer
- [ ] Loading state durante generación
- [ ] Mensajes de error claros
- [ ] Toast de confirmación
- [ ] Nombre de archivo descriptivo

## Anti-Patterns to Avoid

### Arquitectura
- ❌ NO importar Prisma fuera de services/
- ❌ NO crear API routes si Server Actions funcionan
- ❌ NO romper co-ubicación modular
- ❌ NO exponer URLs de Blob sin autenticación

### Implementación
- ❌ NO generar PDFs síncronamente en el request principal
- ❌ NO almacenar PDFs permanentemente (usar URLs temporales)
- ❌ NO cargar Chromium completo en desarrollo
- ❌ NO ignorar límites de tamaño de Vercel
- ❌ NO hardcodear estilos - usar sistema de diseño Tinta

### Seguridad
- ❌ NO permitir acceso sin verificar workspace membership
- ❌ NO exponer rutas internas o IDs en PDFs públicos
- ❌ NO incluir información sensible (IPs, IDs internos)
- ❌ NO generar PDFs sin límite de rate

## Score de Confianza: 9/10

Este PRP proporciona una guía completa y ejecutable para implementar la exportación de respuestas a PDF. La única razón para no ser 10/10 es la potencial complejidad de configurar Puppeteer en Vercel, que puede requerir ajustes específicos según el plan.
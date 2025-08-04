# Ejemplo de Implementación: Puppeteer PDF en Next.js 15

Este documento proporciona un ejemplo práctico de implementación de Puppeteer para generar PDFs con layouts complejos en Next.js 15.

## Instalación de Dependencias

```bash
pnpm add puppeteer @sparticuz/chromium-min
pnpm add -D @types/puppeteer
```

## Estructura de Archivos

```
src/
├── app/
│   ├── api/
│   │   └── generate-pdf/
│   │       └── route.ts          # API Route para generación
│   └── pdf-preview/
│       └── [id]/
│           └── page.tsx          # Página de preview HTML
├── lib/
│   ├── pdf-generator.ts          # Lógica de generación PDF
│   └── pdf-templates.ts          # Templates HTML para PDFs
└── types/
    └── pdf.ts                    # Tipos TypeScript
```

## 1. Configuración del Generador PDF

```typescript
// src/lib/pdf-generator.ts
import puppeteer from 'puppeteer';
import { chromium } from '@sparticuz/chromium-min';

export interface PDFConfig {
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  printBackground?: boolean;
}

export class TintaPDFGenerator {
  private static async getBrowser() {
    // Configuración para producción (Vercel/AWS Lambda)
    if (process.env.NODE_ENV === 'production') {
      return puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    // Configuración para desarrollo
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  static async generateFromHTML(
    html: string, 
    config: PDFConfig = {}
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Configurar viewport para consistency
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });

      // Cargar contenido HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Esperar a que las fuentes se carguen
      await page.evaluateHandle('document.fonts.ready');

      // Generar PDF
      const pdf = await page.pdf({
        format: config.format || 'A4',
        printBackground: config.printBackground ?? true,
        margin: config.margin || {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm'
        },
        preferCSSPageSize: true,
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
      await browser.close();
    }
  }

  static async generateFromURL(
    url: string, 
    config: PDFConfig = {}
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await page.evaluateHandle('document.fonts.ready');

      const pdf = await page.pdf({
        format: config.format || 'A4',
        printBackground: config.printBackground ?? true,
        margin: config.margin || {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm'
        },
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
      await browser.close();
    }
  }
}
```

## 2. Templates HTML para PDFs

```typescript
// src/lib/pdf-templates.ts
export interface DesignData {
  title: string;
  description: string;
  images: string[];
  brandColors: string[];
  typography: {
    primary: string;
    secondary: string;
  };
  layout: 'two-column' | 'single-column' | 'grid';
}

export class TintaPDFTemplates {
  static generateDesignTemplate(data: DesignData): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - Tinta</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${data.brandColors[0] || '#8B1538'};
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      color: ${data.brandColors[0] || '#8B1538'};
    }

    .title {
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .description {
      font-size: 14px;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.7;
    }

    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .column {
      background: #fafafa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid ${data.brandColors[0] || '#8B1538'};
    }

    .column h3 {
      font-size: 18px;
      margin-bottom: 15px;
      color: ${data.brandColors[0] || '#8B1538'};
    }

    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 30px 0;
    }

    .image-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .image-container img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .color-palette {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }

    .color-swatch {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .typography-section {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .font-example {
      margin: 15px 0;
    }

    .font-primary {
      font-family: ${data.typography.primary}, 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 600;
    }

    .font-secondary {
      font-family: ${data.typography.secondary}, 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 400;
    }

    .footer {
      position: absolute;
      bottom: 20mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #888;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; }
      .page { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="header">
      <div class="logo">TINTA</div>
      <div style="font-size: 12px; color: #666;">
        Generado: ${new Date().toLocaleDateString('es-ES')}
      </div>
    </header>

    <main>
      <h1 class="title">${data.title}</h1>
      <p class="description">${data.description}</p>

      ${data.layout === 'two-column' ? `
      <div class="two-column">
        <div class="column">
          <h3>Concepto Principal</h3>
          <p>Descripción detallada del concepto principal del diseño, 
             incluyendo los elementos clave y la dirección creativa.</p>
        </div>
        <div class="column">
          <h3>Elementos Visuales</h3>
          <p>Análisis de los elementos visuales utilizados, 
             paleta de colores, tipografía y composición general.</p>
        </div>
      </div>
      ` : ''}

      ${data.images.length > 0 ? `
      <section>
        <h3 style="margin-bottom: 20px; color: ${data.brandColors[0] || '#8B1538'};">
          Galería de Imágenes
        </h3>
        <div class="image-gallery">
          ${data.images.map(img => `
            <div class="image-container">
              <img src="${img}" alt="Diseño" />
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <section class="typography-section">
        <h3 style="margin-bottom: 15px;">Tipografía</h3>
        <div class="font-example">
          <div class="font-primary">Tipografía Principal</div>
          <small>Font: ${data.typography.primary}</small>
        </div>
        <div class="font-example">
          <div class="font-secondary">Tipografía Secundaria</div>
          <small>Font: ${data.typography.secondary}</small>
        </div>
      </section>

      ${data.brandColors.length > 0 ? `
      <section>
        <h3 style="margin: 30px 0 15px; color: ${data.brandColors[0] || '#8B1538'};">
          Paleta de Colores
        </h3>
        <div class="color-palette">
          ${data.brandColors.map(color => `
            <div class="color-swatch" style="background-color: ${color};" 
                 title="${color}"></div>
          `).join('')}
        </div>
      </section>
      ` : ''}
    </main>

    <footer class="footer">
      <p>Tinta Dashboard - Generación automatizada de PDFs de diseño</p>
    </footer>
  </div>
</body>
</html>`;
  }
}
```

## 3. API Route para Generación

```typescript
// src/app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TintaPDFGenerator } from '@/lib/pdf-generator';
import { TintaPDFTemplates, DesignData } from '@/lib/pdf-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designData, config } = body;

    // Validar datos de entrada
    if (!designData || typeof designData !== 'object') {
      return NextResponse.json(
        { error: 'Datos de diseño requeridos' },
        { status: 400 }
      );
    }

    // Generar HTML del template
    const html = TintaPDFTemplates.generateDesignTemplate(designData as DesignData);

    // Generar PDF
    const pdfBuffer = await TintaPDFGenerator.generateFromHTML(html, config);

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${designData.title || 'design'}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## 4. Tipos TypeScript

```typescript
// src/types/pdf.ts
export interface PDFGenerationRequest {
  designData: DesignData;
  config?: PDFConfig;
}

export interface PDFGenerationResponse {
  success: boolean;
  message?: string;
  downloadUrl?: string;
}

export interface DesignData {
  title: string;
  description: string;
  images: string[];
  brandColors: string[];
  typography: {
    primary: string;
    secondary: string;
  };
  layout: 'two-column' | 'single-column' | 'grid';
}

export interface PDFConfig {
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  printBackground?: boolean;
}
```

## 5. Uso desde el Frontend

```typescript
// Ejemplo de uso en un componente
export async function generateDesignPDF(designData: DesignData) {
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        designData,
        config: {
          format: 'A4',
          printBackground: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Error generando PDF');
    }

    // Descargar el PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${designData.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

## 6. Optimizaciones para Producción

### Variables de Entorno

```env
# .env.local
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
NODE_ENV=production
```

### Configuración Vercel

```json
// vercel.json
{
  "functions": {
    "src/app/api/generate-pdf/route.ts": {
      "maxDuration": 30
    }
  },
  "build": {
    "env": {
      "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD": "true"
    }
  }
}
```

## 7. Manejo de Errores y Timeouts

```typescript
// src/lib/pdf-generator.ts (versión mejorada)
export class TintaPDFGenerator {
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly MAX_RETRIES = 3;

  static async generateWithRetry(
    html: string, 
    config: PDFConfig = {},
    retries = this.MAX_RETRIES
  ): Promise<Buffer> {
    try {
      return await this.generateFromHTML(html, config);
    } catch (error) {
      if (retries > 0) {
        console.warn(`PDF generation failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.generateWithRetry(html, config, retries - 1);
      }
      throw error;
    }
  }

  private static async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF generation timeout')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }
}
```

## 8. Testing

```typescript
// tests/pdf-generation.test.ts
import { TintaPDFGenerator } from '@/lib/pdf-generator';
import { TintaPDFTemplates } from '@/lib/pdf-templates';

describe('PDF Generation', () => {
  const mockDesignData = {
    title: 'Test Design',
    description: 'Test description',
    images: [],
    brandColors: ['#8B1538', '#FFF'],
    typography: {
      primary: 'Inter',
      secondary: 'Arial'
    },
    layout: 'two-column' as const
  };

  test('should generate PDF from HTML template', async () => {
    const html = TintaPDFTemplates.generateDesignTemplate(mockDesignData);
    const pdf = await TintaPDFGenerator.generateFromHTML(html);
    
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(1000);
  });

  test('should handle invalid data gracefully', async () => {
    await expect(
      TintaPDFGenerator.generateFromHTML('')
    ).rejects.toThrow();
  });
});
```

## Conclusión

Esta implementación proporciona:

- ✅ **Replicación exacta** de diseños complejos
- ✅ **Layouts de dos columnas** con CSS Grid/Flexbox
- ✅ **Embebido de imágenes** nativo
- ✅ **Control fino de estilos** con CSS completo
- ✅ **Compatibilidad Next.js 15** con App Router
- ✅ **Performance optimizada** para producción
- ✅ **Manejo de errores** robusto
- ✅ **Tipado TypeScript** completo

El ejemplo demuestra cómo Puppeteer puede generar PDFs de alta calidad que replican exactamente el diseño visual, cumpliendo con todos los requisitos especificados para el proyecto Tinta Dashboard.
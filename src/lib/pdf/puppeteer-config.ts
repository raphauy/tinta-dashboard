import puppeteer, { Browser, Page, LaunchOptions } from 'puppeteer'
import chromium from '@sparticuz/chromium'

// Configuración base para Puppeteer
export interface PDFConfig {
  format?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  margin?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  printBackground?: boolean
  preferCSSPageSize?: boolean
}

// Configuración de Puppeteer para diferentes entornos
export async function getPuppeteerConfig(): Promise<LaunchOptions> {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Configuración para Vercel/AWS Lambda
    return {
      args: chromium.args,
      defaultViewport: null,
      executablePath: await chromium.executablePath(),
      headless: true,
    }
  }

  // Configuración para desarrollo local
  return {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--single-process' // Útil para desarrollo
    ],
    // Por defecto Puppeteer encontrará Chrome automáticamente
  }
}

// Crear browser con reintentos
export async function createBrowser(maxRetries = 3): Promise<Browser> {
  const config = await getPuppeteerConfig()
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await puppeteer.launch(config)
    } catch (error) {
      console.error(`Error al lanzar browser (intento ${i + 1}):`, error)
      
      if (i === maxRetries - 1) {
        throw error
      }
      
      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  
  throw new Error('No se pudo lanzar el browser después de múltiples intentos')
}

// Generar PDF desde HTML con timeout y manejo de errores
export async function generatePDFFromHTML(
  html: string,
  config: PDFConfig = {},
  timeout = 30000
): Promise<Buffer> {
  let browser: Browser | null = null
  let page: Page | null = null
  
  try {
    browser = await createBrowser()
    page = await browser.newPage()
    
    // Configurar viewport para consistencia
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    })
    
    // Configurar timeout
    page.setDefaultTimeout(timeout)
    
    // Cargar contenido HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: timeout
    })
    
    // Esperar a que las fuentes se carguen
    await page.evaluateHandle('document.fonts.ready')
    
    // Generar PDF con configuración por defecto mejorada
    const pdfBuffer = await page.pdf({
      format: config.format || 'A4',
      printBackground: config.printBackground ?? true,
      margin: config.margin || {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },
      preferCSSPageSize: config.preferCSSPageSize ?? false,
      displayHeaderFooter: false,
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    // Limpiar recursos
    if (page) {
      await page.close().catch(console.error)
    }
    if (browser) {
      await browser.close().catch(console.error)
    }
  }
}

// Generar PDF desde URL
export async function generatePDFFromURL(
  url: string,
  config: PDFConfig = {},
  timeout = 30000
): Promise<Buffer> {
  let browser: Browser | null = null
  let page: Page | null = null
  
  try {
    browser = await createBrowser()
    page = await browser.newPage()
    
    // Configurar viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    })
    
    // Configurar timeout
    page.setDefaultTimeout(timeout)
    
    // Navegar a la URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: timeout
    })
    
    // Esperar a que las fuentes se carguen
    await page.evaluateHandle('document.fonts.ready')
    
    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: config.format || 'A4',
      printBackground: config.printBackground ?? true,
      margin: config.margin || {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm'
      },
      preferCSSPageSize: config.preferCSSPageSize ?? false,
      displayHeaderFooter: false,
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    // Limpiar recursos
    if (page) {
      await page.close().catch(console.error)
    }
    if (browser) {
      await browser.close().catch(console.error)
    }
  }
}

// Configuración específica para PDFs de respuestas de formularios
export const RESPONSE_PDF_CONFIG: PDFConfig = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    bottom: '20mm',
    left: '20mm',
    right: '20mm'
  },
  preferCSSPageSize: false
}
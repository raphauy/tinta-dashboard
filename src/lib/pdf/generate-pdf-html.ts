import { type ResponseWithForm } from '@/services/form-response-service'
import { type FormField } from '@/types/forms'
import { getTintaColor } from '@/lib/tinta-colors'

// Función para escapar HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Función para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// Función para obtener el ícono del tipo de archivo
function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊'
  if (fileType.includes('word') || fileType.includes('document')) return '📝'
  if (fileType.includes('zip') || fileType.includes('compressed')) return '📦'
  return '📎'
}

export function generatePDFHTML(response: ResponseWithForm): string {
  const { form, data: responseData, files, submittedAt } = response
  const fields = (form.fields as unknown) as FormField[]
  const sortedFields = fields.sort((a, b) => a.order - b.order)
  const circleColor = getTintaColor(form.color || 'rosaVino') || '#DDBBC0'

  // Construir el HTML manualmente
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      position: relative;
    }

    /* Header estilo PDF */
    .header-section {
      padding: 32px 48px 24px 48px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }

    .title-section {
      flex: 1;
      padding-top: 4px;
    }

    .title-with-circle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: -8px;
    }

    .main-title {
      font-size: 64px;
      font-weight: 700;
      line-height: 0.9;
      letter-spacing: -0.03em;
      color: #8A8A7C;
    }

    .color-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .subtitle {
      font-size: 64px;
      font-weight: 700;
      line-height: 0.9;
      letter-spacing: -0.03em;
      color: #8A8A7C;
    }

    .metadata-section {
      width: 320px;
      margin-top: 8px;
    }

    .metadata-item {
      display: flex;
      align-items: baseline;
      gap: 12px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }

    .metadata-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #999;
      font-weight: 500;
      white-space: nowrap;
    }

    .metadata-value {
      font-size: 14px;
      color: #666;
      flex: 1;
      text-align: right;
    }

    .divider {
      border-bottom: 2px solid #e5e5e5;
      margin: 0 48px;
    }

    .description-section {
      text-align: center;
      padding: 16px 48px 24px 48px;
    }

    .description {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #8A8A7C;
    }

    /* Contenido del formulario */
    .content {
      padding: 32px 48px 48px 48px;
    }

    .field-container {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .field-number {
      font-size: 14px;
      color: #999;
      margin-bottom: 4px;
    }

    .field-label {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }

    .field-value {
      font-size: 14px;
      line-height: 1.5;
      color: #555;
      padding: 12px 16px;
      background-color: #f9f9f9;
      border-radius: 12px;
      border: 1px solid #e5e5e5;
      white-space: pre-line;
      word-wrap: break-word;
      word-break: break-word;
    }

    .field-value.empty {
      color: #999;
      font-style: italic;
    }

    /* Archivos adjuntos */
    .files-section {
      margin-top: 16px;
    }

    .files-title {
      font-size: 12px;
      font-weight: 600;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    /* Contenedor de archivo individual - se mantiene junto */
    .file-container {
      page-break-inside: avoid;
      margin-bottom: 20px;
    }

    .file-container:last-child {
      margin-bottom: 0;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      margin-bottom: 0;
    }

    .file-icon {
      font-size: 20px;
    }

    .file-info {
      flex: 1;
    }

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 2px;
    }

    .file-meta {
      font-size: 12px;
      color: #666;
    }

    /* Imágenes embebidas */
    .image-preview {
      margin-top: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
      padding: 8px;
      background-color: #f9f9f9;
    }

    .image-preview img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 400px;
      object-fit: contain;
      border-radius: 4px;
    }

    /* Footer */
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px 48px;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #999;
      background-color: white;
    }

    .footer-logo {
      font-weight: 700;
      color: #143F3B;
      font-size: 14px;
      letter-spacing: 0.05em;
    }

    .footer-info {
      text-align: right;
    }

    /* Para páginas adicionales */
    @page {
      size: A4;
      margin: 0;
    }
    
    @page :first {
      margin: 0;
    }
    
    @page :left {
      margin-top: 40px;
    }
    
    @page :right {
      margin-top: 40px;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page {
        margin: 0;
        page-break-after: always;
      }
      
      .field-container {
        page-break-inside: avoid;
      }
      
      .image-preview {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">`

  // Título con círculo si aplica
  if (form.title2 && form.color) {
    html += `
          <div>
            <div class="title-with-circle">
              <h1 class="main-title">${escapeHtml(form.title)}</h1>
              <div class="color-circle" style="background-color: ${circleColor}"></div>
            </div>
            <h2 class="subtitle">${escapeHtml(form.title2)}</h2>
          </div>`
  } else {
    html += `
          <h1 class="main-title">${escapeHtml(form.title)}</h1>`
  }

  html += `
        </div>
        
        <div class="metadata-section">
          <div class="metadata-item">
            <div class="metadata-label">NOMBRE DEL PROYECTO</div>
            <div class="metadata-value">${escapeHtml(form.projectName || "—")}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">CLIENTE</div>
            <div class="metadata-value">${escapeHtml(form.client || form.workspace.name)}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">FECHA DE ENVÍO</div>
            <div class="metadata-value">${new Date(submittedAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="divider"></div>`

  // Descripción si existe
  if (form.subtitle) {
    html += `
    <div class="description-section">
      <p class="description">${escapeHtml(form.subtitle)}</p>
    </div>
    <div class="divider"></div>`
  }

  // Contenido
  html += `
    <div class="content">`

  // Campos y respuestas
  sortedFields.forEach((field, index) => {
    const fieldValue = responseData && typeof responseData === 'object' && !Array.isArray(responseData) 
      ? (responseData as Record<string, unknown>)[field.id] as string | undefined
      : undefined
    const fieldFiles = files.filter(file => file.fieldName === field.id)
    const fieldNumber = String(index + 1).padStart(2, '0')
    
    html += `
      <div class="field-container">
        <div class="field-number">${fieldNumber}</div>
        <div class="field-label">${escapeHtml(field.label)}</div>
        <div class="field-value${!fieldValue ? ' empty' : ''}">${escapeHtml((fieldValue || '(Sin respuesta)').trim())}</div>`

    // Archivos adjuntos
    if (fieldFiles.length > 0) {
      html += `
        <div class="files-section">
          <div class="files-title">Archivos adjuntos</div>`

      fieldFiles.forEach(file => {
        const isImage = file.fileType.startsWith('image/')
        
        html += `
          <div class="file-container">
            <div class="file-item">
              <div class="file-icon">${getFileIcon(file.fileType)}</div>
              <div class="file-info">
                <div class="file-name">${escapeHtml(file.fileName)}</div>
                <div class="file-meta">
                  ${formatFileSize(file.fileSize)} • ${escapeHtml(file.fileType)}
                </div>
              </div>
            </div>`

        if (isImage) {
          html += `
            <div class="image-preview">
              <img src="${escapeHtml(file.fileUrl)}" alt="${escapeHtml(file.fileName)}">
            </div>`
        }

        html += `
          </div>`
      })

      html += `
        </div>`
    }

    html += `
      </div>`
  })

  html += `
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">TINTA</div>
      <div class="footer-info">
        <div>Respuesta ID: ${escapeHtml(response.id)}</div>
        <div>Generado el ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
    </div>
  </div>
</body>
</html>`

  return html
}